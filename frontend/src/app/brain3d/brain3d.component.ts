import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  HostListener
} from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-brain3d',
  standalone: true,
  templateUrl: './brain3d.component.html',
  styleUrls: ['./brain3d.component.css']
})
export class Brain3dComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLDivElement>;

  @Input() diagnosis!: string;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private brain?: THREE.Object3D;
  private animationId = 0;
  
  // Mouse interaction
  private mouseX = 0;
  private mouseY = 0;
  private targetRotationX = 0;
  private targetRotationY = 0;

  /* ===================== */
  /* Lifecycle hooks       */
  /* ===================== */

  ngAfterViewInit() {
    this.initScene();
    this.loadBrainModel();
    this.animate();
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('scroll', this.onScroll);
    
    // Force resize after a short delay to ensure container is rendered
    setTimeout(() => this.handleResize(), 100);
    setTimeout(() => this.handleResize(), 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['diagnosis'] && this.brain) {
      this.updateColor();
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.renderer?.dispose();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('scroll', this.onScroll);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.handleResize();
  }

  private handleResize = () => {
    if (!this.renderer || !this.camera || !this.canvasRef?.nativeElement) return;
    const container = this.canvasRef.nativeElement;
    // Use viewport dimensions if container dimensions are too small
    let width = container.clientWidth;
    let height = container.clientHeight;
    if (width < 100 || height < 100) {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  
  // Smooth mouse follow
  private onMouseMove = (event: MouseEvent) => {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };
  
  // Scroll-based rotation
  private onScroll = () => {
    const scrollY = window.scrollY;
    if (this.brain) {
      this.targetRotationY = scrollY * 0.001;
    }
  };

  /* ===================== */
  /* Scene setup           */
  /* ===================== */

  private initScene() {
    const container = this.canvasRef.nativeElement;
    // Use viewport dimensions for fullscreen background mode
    let width = container.clientWidth;
    let height = container.clientHeight;
    if (width < 100 || height < 100) {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 3.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Enhanced lighting for medical visualization
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    this.scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);
    
    const rimLight = new THREE.PointLight(0x3b82f6, 1.5, 15);
    rimLight.position.set(-3, -2, 4);
    this.scene.add(rimLight);
    
    const backLight = new THREE.PointLight(0x06b6d4, 1.0, 12);
    backLight.position.set(0, 5, -5);
    this.scene.add(backLight);

    // Controls for user interaction
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.autoRotate = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 8;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    window.addEventListener('resize', this.handleResize);
  }


  /* ===================== */
  /* Model loading         */
  /* ===================== */

  private loadBrainModel() {
    const loader = new GLTFLoader();

    const candidatePaths = [
      '/assets/models/brain/scene.gltf',
      'assets/models/brain/scene.gltf',
      '/assets/brain/scene.gltf',
      'assets/brain/scene.gltf'
    ];

    const tryNext = (index: number) => {
      if (index >= candidatePaths.length) {
        this.buildFallbackSphere();
        return;
      }

      const path = candidatePaths[index];
      loader.load(
        path,
        (gltf) => {
          this.brain = gltf.scene;
          this.centerAndScale(this.brain);
          this.scene.add(this.brain);
          this.updateColor();
          this.controls.update();
          // Optional slight idle rotation for dynamism
          // this.brain.rotation.y += 0.002;
        },
        undefined,
        () => tryNext(index + 1)
      );
    };

    tryNext(0);
  }

  private buildFallbackSphere() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = this.makeStylizedMaterial(this.getColorForDiagnosis());
    this.brain = new THREE.Mesh(geometry, material);
    this.scene.add(this.brain);
    this.updateColor();
  }

  private centerAndScale(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    object.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 2 / maxDim;
      object.scale.setScalar(scale);
    }
  }

  /* ===================== */
  /* Animation             */
  /* ===================== */

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    if (this.brain) {
      // Smooth mouse follow
      this.targetRotationX = this.mouseY * 0.3;
      this.targetRotationY += this.mouseX * 0.002;
      
      // Apply smooth rotation
      this.brain.rotation.x += (this.targetRotationX - this.brain.rotation.x) * 0.05;
      this.brain.rotation.y += (this.targetRotationY - this.brain.rotation.y) * 0.05;
      
      // Subtle idle animation
      this.brain.rotation.y += 0.001;
    }
    
    if (this.controls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);
  };

  /* ===================== */
  /* Color update          */
  /* ===================== */

  private updateColor() {
    if (!this.brain) return;

    const color = this.getColorForDiagnosis();
    this.brain.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.material = this.makeStylizedMaterial(color);
      }
    });
  }

  private getColorForDiagnosis(): number {
    switch (this.diagnosis?.toLowerCase()) {
      case 'alzheimer':
        return 0xef4444; // Red for Alzheimer
      case 'early_stage':
      case 'early stage':
        return 0xfbbf24; // Amber for Early Stage
      default:
        return 0x10b981; // Green for Normal
    }
  }

  private makeStylizedMaterial(color: number) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.4,
      metalness: 0.3,
      roughness: 0.4,
      transparent: false,
      side: THREE.FrontSide
    });
  }
}
