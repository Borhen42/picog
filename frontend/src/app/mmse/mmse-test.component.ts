import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-mmse-test',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mmse-test.component.html',
  styleUrl: './mmse-test.component.css'
})
export class MMSETestComponent implements OnInit {
  patientName: string = '';
  testDate: string = new Date().toISOString().split('T')[0];
  notes: string = '';

  /**
   * QCM Mode:
   * - Each question has multiple options (radio).
   * - The app knows the "correct" option and computes score automatically.
   */
  context = {
    // Used to grade "Orientation to Place" questions
    state: '',
    county: '',
    city: '',
    building: '',
    floor: ''
  };

  answers: Record<string, string> = {};
  questionsBySection: Record<SectionKey, Question[]> = {
    intro: [],
    'orientation-time': [],
    'orientation-place': [],
    registration: [],
    'attention-calculation': [],
    recall: [],
    language: [],
    'visual-spatial': [],
    result: []
  };

  currentSection: string = 'intro';
  loading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  totalScore: number = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.currentSection = 'intro';
    this.rebuildQuestions();
  }

  startTest(): void {
    if (!this.patientName.trim()) {
      this.error = 'Please enter patient name';
      return;
    }

    // For "Orientation to Place" grading, context must be provided.
    const missingContext =
      !this.context.state.trim() ||
      !this.context.county.trim() ||
      !this.context.city.trim() ||
      !this.context.building.trim() ||
      !this.context.floor.trim();

    if (missingContext) {
      this.error = 'Please fill the test location (state/county/city/building/floor) to start.';
      return;
    }

    this.error = null;
    this.rebuildQuestions();
    this.currentSection = 'orientation-time';
  }

  nextSection(nextSection: string): void {
    this.error = null;
    const current = this.currentSection as SectionKey;
    if (this.hasQuestions(current) && !this.isSectionComplete(current)) {
      this.error = 'Please answer all questions before continuing.';
      return;
    }
    this.currentSection = nextSection;
    window.scrollTo(0, 0);
  }

  calculateScore(): number {
    const keys: SectionKey[] = [
      'orientation-time',
      'orientation-place',
      'registration',
      'attention-calculation',
      'recall',
      'language',
      'visual-spatial'
    ];
    return keys.reduce((sum, key) => sum + this.getSectionScore(key), 0);
  }

  getInterpretation(score: number): string {
    if (score >= 24) return 'Normal cognition';
    if (score >= 18) return 'Mild cognitive impairment';
    if (score >= 12) return 'Moderate cognitive impairment';
    return 'Severe cognitive impairment';
  }

  submitTest(): void {
    const current = this.currentSection as SectionKey;
    if (this.hasQuestions(current) && !this.isSectionComplete(current)) {
      this.error = 'Please answer all questions before submitting.';
      return;
    }

    this.totalScore = this.calculateScore();
    this.loading = true;
    this.error = null;

    const testData = {
      patient_name: this.patientName,
      orientation_score: this.getOrientationScore(),
      registration_score: this.getRegistrationScore(),
      attention_score: this.getAttentionScore(),
      recall_score: this.getRecallScore(),
      language_score: this.getLanguageScore(),
      total_score: this.totalScore,
      interpretation: this.getInterpretation(this.totalScore),
      test_date: this.testDate,
      notes: this.notes,
      // optional details for audit/debug
      answers: this.answers
    };

    // Submit to backend
    this.adminService.submitMMSETest(testData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = `Test submitted successfully! Score: ${this.totalScore}/30`;
        this.currentSection = 'result';
        setTimeout(() => {
          this.resetTest();
        }, 5000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Failed to submit test. ' + (err.error?.message || err.message);
      }
    });
  }

  resetTest(): void {
    this.patientName = '';
    this.testDate = new Date().toISOString().split('T')[0];
    this.notes = '';
    this.totalScore = 0;
    this.success = null;
    this.error = null;
    this.currentSection = 'intro';

    this.answers = {};
    this.context = {
      state: '',
      county: '',
      city: '',
      building: '',
      floor: ''
    };
    this.rebuildQuestions();
  }

  goHome(): void {
    window.location.href = '/';
  }

  // Helper methods for template
  getOrientationScore(): number {
    return this.getSectionScore('orientation-time') + this.getSectionScore('orientation-place');
  }

  getRegistrationScore(): number {
    return this.getSectionScore('registration');
  }

  getAttentionScore(): number {
    return this.getSectionScore('attention-calculation');
  }

  getRecallScore(): number {
    return this.getSectionScore('recall');
  }

  getLanguageScore(): number {
    return this.getSectionScore('language');
  }

  getVisualScore(): number {
    return this.getSectionScore('visual-spatial');
  }

  getQuestions(section: SectionKey): Question[] {
    return this.questionsBySection[section] ?? [];
  }

  getSectionScore(section: SectionKey): number {
    const qs = this.getQuestions(section);
    return qs.reduce((sum, q) => sum + (this.isCorrect(q) ? q.points : 0), 0);
  }

  hasQuestions(section: SectionKey): boolean {
    return this.getQuestions(section).length > 0;
  }

  isSectionComplete(section: SectionKey): boolean {
    const qs = this.getQuestions(section);
    if (!qs.length) return true;
    return qs.every((q) => typeof this.answers[q.id] === 'string' && this.answers[q.id].length > 0);
  }

  isCorrect(q: Question): boolean {
    return this.answers[q.id] === q.correctValue;
  }

  private rebuildQuestions(): void {
    const d = this.safeDate(this.testDate);
    const year = String(d.getFullYear());
    const month = d.toLocaleString('en-US', { month: 'long' });
    const dayName = d.toLocaleString('en-US', { weekday: 'long' });
    const dateNum = String(d.getDate());
    const season = this.getSeason(d);

    const yearOptions = this.withCorrectFirst(
      year,
      this.pickDistinct(
        [String(d.getFullYear() - 1), String(d.getFullYear() - 2), '2022', '2001', '2019', '2024', '2007'],
        3,
        new Set([year])
      )
    );

    const monthOptions = this.withCorrectFirst(
      month,
      this.pickDistinct(
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ],
        3,
        new Set([month])
      )
    );

    const dateOptions = this.withCorrectFirst(
      dateNum,
      this.pickDistinct(
        Array.from({ length: 31 }, (_, i) => String(i + 1)),
        3,
        new Set([dateNum])
      )
    );

    const weekdayOptions = this.withCorrectFirst(
      dayName,
      this.pickDistinct(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        3,
        new Set([dayName])
      )
    );

    const place = {
      state: this.context.state.trim(),
      county: this.context.county.trim(),
      city: this.context.city.trim(),
      building: this.context.building.trim(),
      floor: this.context.floor.trim()
    };

    this.questionsBySection['orientation-time'] = [
      this.q('ot_year', 'What is the year?', this.shuffle(yearOptions), year),
      this.q('ot_season', 'What is the season?', this.shuffle(this.unique([season, 'Winter', 'Spring', 'Summer', 'Autumn'])), season),
      this.q('ot_month', 'What is the month?', this.shuffle(monthOptions), month),
      this.q('ot_date', 'What is the date?', this.shuffle(dateOptions), dateNum),
      this.q('ot_day', 'What is the day of the week?', this.shuffle(weekdayOptions), dayName)
    ].map((qq) => ({ ...qq, points: 1 }));

    this.questionsBySection['orientation-place'] = [
      this.q('op_state', 'What state are we in?', this.makePlaceOptions(place.state), place.state),
      this.q('op_county', 'What county are we in?', this.makePlaceOptions(place.county), place.county),
      this.q('op_city', 'What city are we in?', this.makePlaceOptions(place.city), place.city),
      this.q('op_building', 'What building are we in?', this.makePlaceOptions(place.building), place.building),
      this.q('op_floor', 'What floor are we on?', this.makeFloorOptions(place.floor), place.floor)
    ].map((qq) => ({ ...qq, points: 1 }));

    // Registration (fixed 3 words, each 1 point)
    this.questionsBySection.registration = [
      this.q('reg_1', 'Word #1 (repeat/recognize):', this.shuffle(['Apple', 'Penny', 'Table', 'Chair']), 'Apple'),
      this.q('reg_2', 'Word #2 (repeat/recognize):', this.shuffle(['Penny', 'Apple', 'Bottle', 'River']), 'Penny'),
      this.q('reg_3', 'Word #3 (repeat/recognize):', this.shuffle(['Table', 'Window', 'Penny', 'Garden']), 'Table')
    ].map((qq) => ({ ...qq, points: 1 }));

    // Attention & Calculation (serial 7s) - 5 points
    this.questionsBySection['attention-calculation'] = [
      this.q('att_1', '100 - 7 = ?', ['93', '92', '94', '91'], '93'),
      this.q('att_2', '93 - 7 = ?', ['86', '85', '87', '84'], '86'),
      this.q('att_3', '86 - 7 = ?', ['79', '78', '80', '77'], '79'),
      this.q('att_4', '79 - 7 = ?', ['72', '71', '73', '70'], '72'),
      this.q('att_5', '72 - 7 = ?', ['65', '64', '66', '63'], '65')
    ].map((qq) => ({ ...qq, points: 1 }));

    // Recall (3 points)
    this.questionsBySection.recall = [
      this.q('rec_1', 'Recall word #1:', this.shuffle(['Apple', 'Stone', 'Penny', 'Book']), 'Apple'),
      this.q('rec_2', 'Recall word #2:', this.shuffle(['Penny', 'Cloud', 'Table', 'River']), 'Penny'),
      this.q('rec_3', 'Recall word #3:', this.shuffle(['Table', 'Garden', 'Apple', 'Window']), 'Table')
    ].map((qq) => ({ ...qq, points: 1 }));

    // Language (8 points)
    this.questionsBySection.language = [
      this.q('lang_n1', 'Naming: choose the correct word for ⌚', this.shuffle(['Watch', 'Pencil', 'Key', 'Book']), 'Watch', 1),
      this.q('lang_n2', 'Naming: choose the correct word for ✏️', this.shuffle(['Pencil', 'Watch', 'Cup', 'Phone']), 'Pencil', 1),
      this.q(
        'lang_rep',
        'Repetition: select the exact phrase.',
        this.shuffle(['No ifs, ands, or buts', 'No if and but', 'No is, ands, or buts', 'No ifs and buts']),
        'No ifs, ands, or buts',
        1
      ),
      this.q(
        'lang_cmd1',
        '3‑stage command (Step 1):',
        this.shuffle(['Take the paper in your right hand', 'Fold it in half', 'Put it on the floor', 'Close your eyes']),
        'Take the paper in your right hand',
        1
      ),
      this.q(
        'lang_cmd2',
        '3‑stage command (Step 2):',
        this.shuffle(['Fold it in half', 'Put it on the floor', 'Take the paper in your right hand', 'Stand up']),
        'Fold it in half',
        1
      ),
      this.q(
        'lang_cmd3',
        '3‑stage command (Step 3):',
        this.shuffle(['Put it on the floor', 'Fold it in half', 'Take the paper in your right hand', 'Open the door']),
        'Put it on the floor',
        1
      ),
      this.q(
        'lang_read',
        'Reading: select the instruction.',
        this.shuffle(['CLOSE YOUR EYES', 'OPEN YOUR EYES', 'CLOSE THE DOOR', 'LOOK AT ME']),
        'CLOSE YOUR EYES',
        1
      ),
      this.q(
        'lang_write',
        'Writing: select a complete sentence.',
        this.shuffle(['The sky is blue.', 'Blue sky.', 'Running fast.', 'Because I said so']),
        'The sky is blue.',
        1
      )
    ];

    // Visual-spatial (1 point)
    this.questionsBySection['visual-spatial'] = [
      this.q('vis_1', 'Do the two pentagons intersect correctly?', ['Yes', 'No', 'Not sure', 'Both'], 'Yes', 1)
    ];
  }

  private q(
    id: string,
    text: string,
    options: string[],
    correctValue: string,
    points: number = 1
  ): Question {
    return {
      id,
      text,
      options: options.map((v) => ({ label: v, value: v })),
      correctValue,
      points
    };
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  private pickDistinct(pool: string[], count: number, exclude: Set<string>): string[] {
    const filtered = pool.filter((v) => !exclude.has(v));
    return this.shuffle(this.unique(filtered)).slice(0, count);
  }

  private withCorrectFirst(correct: string, distractors: string[]): string[] {
    return this.unique([correct, ...distractors]).slice(0, 4);
  }

  private safeDate(isoDate: string): Date {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return new Date();
    return d;
  }

  private getSeason(d: Date): string {
    const m = d.getMonth() + 1;
    if (m === 12 || m === 1 || m === 2) return 'Winter';
    if (m >= 3 && m <= 5) return 'Spring';
    if (m >= 6 && m <= 8) return 'Summer';
    return 'Autumn';
  }

  private makePlaceOptions(correct: string): string[] {
    const base = ['North', 'South', 'East', 'West', 'Central', 'Downtown', 'Uptown', 'District 1', 'District 2'];
    const picks = this.shuffle(base).slice(0, 3);
    const opts = this.shuffle([correct, ...picks].filter((v) => v && v.trim().length > 0));
    return opts.length >= 2 ? opts.slice(0, 4) : [correct, 'Unknown', 'N/A', '—'];
  }

  private makeFloorOptions(correct: string): string[] {
    const base = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const picks = this.shuffle(base.filter((v) => v !== correct)).slice(0, 3);
    return this.shuffle([correct, ...picks]).slice(0, 4);
  }
}

type SectionKey =
  | 'intro'
  | 'orientation-time'
  | 'orientation-place'
  | 'registration'
  | 'attention-calculation'
  | 'recall'
  | 'language'
  | 'visual-spatial'
  | 'result';

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctValue: string;
  points: number;
}
