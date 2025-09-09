import { useAnimations, useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { AnimationAction, AnimationClip } from 'three';

interface UseAvatarAnimations {
  actions: Record<string, AnimationAction | null>;
  group: React.MutableRefObject<undefined>;
  idleAnimations: AnimationClip[];
  expressionAnimations: AnimationClip[];
  walkAnimations: AnimationClip[];
  talkingAnimations: AnimationClip[];
}

const useAvatarAnimations = (): UseAvatarAnimations => {
  // import animations
  const { animations: idleAnimation0 } = useGLTF(
    '/models/animations/masculine/idle/F_Standing_Idle_001.glb'
  );
  const { animations: idleAnimation1 } = useGLTF(
    '/models/animations/masculine/idle/F_Standing_Idle_Variations_001.glb'
  );

  const { animations: idleAnimation2 } = useGLTF(
    '/models/animations/masculine/idle/F_Standing_Idle_Variations_002.glb'
  );
  const { animations: idleAnimation3 } = useGLTF(
    '/models/animations/masculine/idle/F_Standing_Idle_Variations_003.glb'
  );

  const { animations: idleAnimation4 } = useGLTF(
    '/models/animations/masculine/idle/M_Standing_Idle_Variations_007.glb'
  );
  const { animations: idleAnimation5 } = useGLTF(
    '/models/animations/masculine/idle/M_Standing_Idle_Variations_005.glb'
  );
  const { animations: idleAnimation6 } = useGLTF(
    '/models/animations/masculine/idle/M_Standing_Idle_002.glb'
  );
  const { animations: idleAnimation7 } = useGLTF(
    '/models/animations/masculine/idle/M_Standing_Idle_Variations_010.glb'
  );
  const { animations: walkAnimation0 } = useGLTF(
    '/models/animations/masculine/locomotion/M_Walk_001.glb'
  );

  const { animations: talkingAnimation0 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_001.glb'
  );

  const { animations: talkingAnimation1 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_002.glb'
  );
  const { animations: talkingAnimation2 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_003.glb'
  );
  const { animations: talkingAnimation3 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_007.glb'
  );

  const { animations: talkingAnimation4 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_009.glb'
  );
  const { animations: talkingAnimation5 } = useGLTF(
    '/models/animations/masculine/expression/F_Talking_Variations_002.glb'
  );
  const { animations: talkingAnimation6 } = useGLTF(
    '/models/animations/masculine/expression/M_Standing_Expressions_004.glb'
  );
  const { animations: talkingAnimation7 } = useGLTF(
    '/models/animations/masculine/expression/M_Standing_Expressions_002.glb'
  );
  const { animations: talkingAnimation8 } = useGLTF(
    '/models/animations/masculine/expression/M_Standing_Expressions_001.glb'
  );
  const { animations: talkingAnimation9 } = useGLTF(
    '/models/animations/masculine/expression/M_Standing_Expressions_012.glb'
  );
  const { animations: talkingAnimation10 } = useGLTF(
    '/models/animations/masculine/expression/M_Standing_Expressions_010.glb'
  );
  const { animations: talkingAnimation11 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_005.glb'
  );
  const { animations: talkingAnimation12 } = useGLTF(
    '/models/animations/masculine/expression/M_Talking_Variations_006.glb'
  );
  const { animations: talkingAnimation13 } = useGLTF(
    '/models/animations/masculine/expression/F_Talking_Variations_002.glb'
  );

  /// /////////////////
  idleAnimation0[0].name = 'Idle0';
  idleAnimation1[0].name = 'Idle1';
  idleAnimation2[0].name = 'Idle2';
  idleAnimation3[0].name = 'Idle3';
  idleAnimation4[0].name = 'Idle4';
  idleAnimation5[0].name = 'Idle5';
  idleAnimation6[0].name = 'Idle6';
  idleAnimation7[0].name = 'Idle7';

  walkAnimation0[0].name = 'Walk';

  talkingAnimation0[0].name = 'M_Talking_Variations_001';
  talkingAnimation1[0].name = 'M_Talking_Variations_002';
  talkingAnimation2[0].name = 'M_Talking_Variations_003';
  talkingAnimation3[0].name = 'M_Talking_Variations_007';
  talkingAnimation4[0].name = 'M_Talking_Variations_009';
  talkingAnimation5[0].name = 'F_Talking_Variations_002';
  talkingAnimation6[0].name = 'M_Standing_Expressions_004';
  talkingAnimation7[0].name = 'M_Standing_Expressions_002';
  talkingAnimation8[0].name = 'M_Standing_Expressions_001';
  talkingAnimation9[0].name = 'M_Standing_Expressions_012';
  talkingAnimation10[0].name = 'M_Standing_Expressions_010';
  talkingAnimation11[0].name = 'M_Talking_Variations_005';
  talkingAnimation12[0].name = 'M_Talking_Variations_006';
  talkingAnimation13[0].name = 'F_Talking_Variations_002';

  const group = useRef(undefined);

  const idleAnimations = [
    idleAnimation0[0],
    idleAnimation1[0],
    idleAnimation2[0],
    idleAnimation3[0],
    idleAnimation4[0],
    idleAnimation5[0],
    idleAnimation6[0],
    idleAnimation7[0]
  ];

  const walkAnimations = [walkAnimation0[0]];

  const expressionAnimations = [
    talkingAnimation6[0], // M_Standing_Expressions_004: talking and nodding head
    talkingAnimation7[0], // M_Standing_Expressions_002: pointing with index in front
    talkingAnimation8[0], // M_Standing_Expressions_001: waving gesture with one hand
    talkingAnimation9[0], // M_Standing_Expressions_012: approving with thumbs up
    talkingAnimation10[0] // M_Standing_Expressions_010: come to me gesture
  ];
  const talkingAnimations = [
    talkingAnimation0[0], // M_Talking_Variations_001: neutral talking
    talkingAnimation1[0], // M_Talking_Variations_002: talking with hands
    talkingAnimation2[0], // M_Talking_Variations_003: talking with hands
    talkingAnimation3[0], // M_Talking_Variations_007: talking with hands
    talkingAnimation4[0], // M_Talking_Variations_009: talking with hands
    talkingAnimation5[0], // F_Talking_Variations_002: talking with hands
    talkingAnimation11[0], // M_Talking_Variations_005: talking and explaining
    talkingAnimation12[0], // M_Talking_Variations_006: talking and explaining
    talkingAnimation13[0] // F_Talking_Variations_002: talking opening arms
  ];
  const { actions } = useAnimations(
    [
      ...idleAnimations,
      ...talkingAnimations,
      ...expressionAnimations,
      ...walkAnimations
    ],
    group
  );

  return {
    actions,
    group,
    idleAnimations,
    expressionAnimations,
    walkAnimations,
    talkingAnimations
  };
};

export default useAvatarAnimations
