import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial, Color } from "three"; // Import Color and MeshStandardMaterial
import { RobotBehaviour } from "./RobotBehaviour";

interface RobotModelProps {
  behaviour: RobotBehaviour;
}

export function RobotModel({ behaviour }: RobotModelProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/RobotExpressive.glb");
  const { actions, mixer } = useAnimations(animations, group);

  // ==========================================
  // CHANGE ROBOT COLOR HERE
  // ==========================================
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        const material = mesh.material as MeshStandardMaterial;

        if (material) {
          // The RobotExpressive model has a material named "Main"
          // which controls the primary body color.
          if (material.name === "Main") {
            // Change to any Hex color you want here
            material.color = new Color("#c5d7fa"); // Tailwind Blue 500
          }
          
          // You can also change the "Grey" or "Black" accents here if you want
          if (material.name === "Grey") {
            material.color = new Color("#414143"); // Tailwind Slate 800
          }
        }
      }
    });
  }, [scene]);
  // ==========================================

  useEffect(() => {
    const playAnim = (name: string, fade = 0.2) => {
      const action = actions[name];
      if (action) {
        Object.values(actions).forEach((a) => a?.fadeOut(fade));
        action.reset().fadeIn(fade).play();
      }
    };

    switch (behaviour.state) {
      case "GREETING":
      case "FAREWELL":
        playAnim("Wave");
        break;
      case "CURIOUS":
        playAnim("Dance");
        break;
      case "OBSERVING":
        playAnim("Idle");
        break;
      case "SURPRISED":
        playAnim("Jump");
        break;
      case "THINKING":
        playAnim("No");
        break;
      case "IDLE":
      default:
        playAnim("Idle");
        break;
    }
  }, [behaviour.state, actions]);

  useFrame((state) => {
    if (!group.current) return;

    // Gentle hover
    group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 - 0.4;

    // Look at cursor
    const targetRotY = behaviour.currentLookAt.x * 0.5;
    const targetRotX = behaviour.currentLookAt.y * 0.3;
    
    group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.1;
    group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.1;

    // Squash and stretch effect when surprised/jumping
    if (behaviour.state === "SURPRISED") {
      const bounce = Math.sin(state.clock.elapsedTime * 15) * 0.1;
      group.current.scale.set(0.35 - bounce, 0.35 + bounce, 0.35 - bounce);
    } else {
      // Return to normal
      group.current.scale.lerp({ x: 0.35, y: 0.35, z: 0.35 } as any, 0.1);
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

useGLTF.preload("/models/RobotExpressive.glb");