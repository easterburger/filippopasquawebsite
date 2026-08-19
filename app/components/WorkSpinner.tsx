"use client";

import { useEffect, useRef } from "react";

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";

import helvetiker from "./fonts/helvetiker_bold.typeface.json";

interface WorkSpinnerProps {
  /** Word extruded inside the ring. */
  text: string;
  /** Spin speed around the vertical axis in radians per second. */
  speed?: number;
  /** Initial rotation so multiple badges don't spin in lockstep. */
  phase?: number;
  /** Static forward tilt in radians. */
  tilt?: number;
  className?: string;
}

let cachedFont: Font | null = null;

function getFont(): Font {
  if (!cachedFont) {
    cachedFont = new FontLoader().parse(
      helvetiker as unknown as Parameters<FontLoader["parse"]>[0],
    );
  }
  return cachedFont;
}

export default function WorkSpinner({
  text,
  speed = 0.55,
  phase = 0,
  tilt = 0.14,
  className,
}: WorkSpinnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        // The tape compositor copies these frames with drawImage, which needs
        // the buffer to survive past presentation.
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    // Studio-style reflections are what sell the chrome; punctual lights alone
    // leave pure metal looking black.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTexture = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envTexture;

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xdfe9ff, 0.55);
    rimLight.position.set(-5, -3, 4);
    scene.add(rimLight);

    const chromeRing = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.07,
      envMapIntensity: 1.25,
    });
    const chromeText = new THREE.MeshPhysicalMaterial({
      color: 0xf0f0f0,
      metalness: 1,
      roughness: 0.17,
      envMapIntensity: 1.1,
    });

    const ringDepth = 1.05;
    const textDepth = 0.72;

    const textGeometry = new TextGeometry(text, {
      font: getFont(),
      size: 1,
      depth: textDepth,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.03,
      bevelSegments: 4,
    });
    textGeometry.computeBoundingBox();
    const textBox = textGeometry.boundingBox!;
    const textWidth = textBox.max.x - textBox.min.x;
    const textHeight = textBox.max.y - textBox.min.y;
    textGeometry.center();

    // The ring is an ellipse sized from the word, so short words get a round
    // badge and long words a flat oval, like the old broadcast logos.
    const rxInner = (textWidth / 2) * 1.18;
    const ryInner = Math.max(textHeight * 1.18, rxInner * 0.42);
    const ringWidth = Math.max(rxInner * 0.09, 0.12);
    const rxOuter = rxInner + ringWidth;
    const ryOuter = ryInner + ringWidth;

    const ringShape = new THREE.Shape();
    ringShape.absellipse(0, 0, rxOuter, ryOuter, 0, Math.PI * 2, false, 0);
    const ringHole = new THREE.Path();
    ringHole.absellipse(0, 0, rxInner, ryInner, 0, Math.PI * 2, true, 0);
    ringShape.holes.push(ringHole);

    const ringGeometry = new THREE.ExtrudeGeometry(ringShape, {
      depth: ringDepth,
      curveSegments: 72,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    ringGeometry.center();

    const group = new THREE.Group();
    group.add(new THREE.Mesh(textGeometry, chromeText));
    group.add(new THREE.Mesh(ringGeometry, chromeRing));
    group.rotation.x = tilt;
    scene.add(group);

    function fitCamera() {
      const fovRadians = THREE.MathUtils.degToRad(camera.fov);
      const halfHeight = ryOuter * 1.22 + ringDepth * 0.2;
      // Mid-spin the projected width peaks around cos45 of radius plus depth.
      const halfWidth = Math.max(
        rxOuter * 1.08,
        (rxOuter + ringDepth / 2) * 0.78,
      );
      const distanceForHeight = halfHeight / Math.tan(fovRadians / 2);
      const distanceForWidth =
        halfWidth / (Math.tan(fovRadians / 2) * camera.aspect);
      camera.position.set(0, 0, Math.max(distanceForHeight, distanceForWidth));
      camera.updateProjectionMatrix();
    }

    function resize() {
      const width = Math.max(1, container!.clientWidth);
      const height = Math.max(1, container!.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      fitCamera();
    }

    resize();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    let raf = 0;
    let running = false;
    let visible = true;
    let destroyed = false;
    let elapsed = phase;
    let lastTime = performance.now();

    function render() {
      group.rotation.y = elapsed;
      renderer.render(scene, camera);
    }

    function frame(now: number) {
      if (destroyed) return;
      if (!visible) {
        running = false;
        return;
      }
      const delta = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      elapsed += delta * speed;
      render();
      if (reducedMotion) {
        // A single styled frame; the badge holds a three-quarter pose.
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (destroyed || running || !visible) return;
      running = true;
      lastTime = performance.now();
      if (reducedMotion) elapsed = phase + 0.5;
      raf = requestAnimationFrame(frame);
    }

    start();

    function onMotionChange() {
      reducedMotion = motionQuery.matches;
      start();
    }
    motionQuery.addEventListener("change", onMotionChange);

    const observer = new ResizeObserver(() => {
      resize();
      start();
      if (reducedMotion) render();
    });
    observer.observe(container);

    const intersection = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (visible) start();
    });
    intersection.observe(container);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      textGeometry.dispose();
      ringGeometry.dispose();
      chromeRing.dispose();
      chromeText.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [text, speed, phase, tilt]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="work-spinner-canvas" />
    </div>
  );
}
