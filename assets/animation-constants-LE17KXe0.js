/**
 * Explicit exit counterpart map.
 * Replaces fragile string.replace('in','out') which corrupted strings like 'spin' -> 'spout'.
 */ const EXIT_COUNTERPART = {
    'fade-in': 'fade-out',
    'fade-in-up': 'fade-out-down',
    'fade-in-down': 'fade-out-up',
    'fade-in-left': 'fade-out-right',
    'fade-in-right': 'fade-out-left',
    'zoom-in': 'zoom-out',
    'scale-up': 'scale-down',
    'bounce-in': 'bounce-out',
    'pop-in': 'pop-out',
    'slide-in-top': 'slide-out-top',
    'slide-in-bottom': 'slide-out-bottom',
    'slide-in-left': 'slide-out-left',
    'slide-in-right': 'slide-out-right',
    'flip-x': 'fade-out',
    'flip-y': 'fade-out',
    'perspective-pop': 'fade-out',
    'expand-vertical': 'collapse-vertical',
    'expand-horizontal': 'collapse-horizontal'
};
/**
 * WAAPI (Web Animations API) keyframe definitions — used by this component's imperative
 * runtime path via `element.animate()`. These are the canonical source for adding or
 * changing a preset. When you add a preset here you MUST also add the matching
 * `@keyframes vi-<name>` rule in `libs/flux-ui/components/_animation.scss`, which serves
 * the parallel CSS-only consumer path (\`animation: vi-fade-in 300ms ...\`).
 * The two representations cannot share a runtime source without a build-time code-gen step.
 */ const PRESET_KEYFRAMES = {
    'fade-in': [
        {
            opacity: 0
        },
        {
            opacity: 1
        }
    ],
    'fade-out': [
        {
            opacity: 1
        },
        {
            opacity: 0
        }
    ],
    'fade-in-up': [
        {
            opacity: 0,
            transform: 'translate3d(0, 1rem, 0)'
        },
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'fade-in-down': [
        {
            opacity: 0,
            transform: 'translate3d(0, -1rem, 0)'
        },
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'fade-in-left': [
        {
            opacity: 0,
            transform: 'translate3d(-1rem, 0, 0)'
        },
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'fade-in-right': [
        {
            opacity: 0,
            transform: 'translate3d(1rem, 0, 0)'
        },
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'fade-out-up': [
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        },
        {
            opacity: 0,
            transform: 'translate3d(0, -1rem, 0)'
        }
    ],
    'fade-out-down': [
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        },
        {
            opacity: 0,
            transform: 'translate3d(0, 1rem, 0)'
        }
    ],
    'fade-out-left': [
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        },
        {
            opacity: 0,
            transform: 'translate3d(-1rem, 0, 0)'
        }
    ],
    'fade-out-right': [
        {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        },
        {
            opacity: 0,
            transform: 'translate3d(1rem, 0, 0)'
        }
    ],
    'zoom-in': [
        {
            opacity: 0,
            transform: 'scale3d(0.92, 0.92, 0.92)'
        },
        {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)'
        }
    ],
    'zoom-out': [
        {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)'
        },
        {
            opacity: 0,
            transform: 'scale3d(0.92, 0.92, 0.92)'
        }
    ],
    'scale-up': [
        {
            transform: 'scale3d(0.8, 0.8, 0.8)'
        },
        {
            transform: 'scale3d(1, 1, 1)'
        }
    ],
    'scale-down': [
        {
            transform: 'scale3d(1.2, 1.2, 1.2)'
        },
        {
            transform: 'scale3d(1, 1, 1)'
        }
    ],
    'bounce-in': [
        {
            opacity: 0,
            transform: 'scale3d(0.3, 0.3, 0.3)',
            offset: 0
        },
        {
            opacity: 0.9,
            transform: 'scale3d(1.08, 1.08, 1.08)',
            offset: 0.5
        },
        {
            opacity: 1,
            transform: 'scale3d(0.95, 0.95, 0.95)',
            offset: 0.75
        },
        {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)',
            offset: 1
        }
    ],
    'bounce-out': [
        {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)',
            offset: 0
        },
        {
            opacity: 1,
            transform: 'scale3d(0.9, 0.9, 0.9)',
            offset: 0.2
        },
        {
            opacity: 1,
            transform: 'scale3d(1.1, 1.1, 1.1)',
            offset: 0.5
        },
        {
            opacity: 0,
            transform: 'scale3d(0.3, 0.3, 0.3)',
            offset: 1
        }
    ],
    'pop-in': [
        {
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)',
            offset: 0
        },
        {
            opacity: 1,
            transform: 'scale3d(1.05, 1.05, 1)',
            offset: 0.7
        },
        {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)',
            offset: 1
        }
    ],
    'pop-out': [
        {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)'
        },
        {
            opacity: 0,
            transform: 'scale3d(0.8, 0.8, 1)'
        }
    ],
    'slide-in-top': [
        {
            transform: 'translate3d(0, -100%, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'slide-in-bottom': [
        {
            transform: 'translate3d(0, 100%, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'slide-in-left': [
        {
            transform: 'translate3d(-100%, 0, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'slide-in-right': [
        {
            transform: 'translate3d(100%, 0, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'slide-out-top': [
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(0, -100%, 0)'
        }
    ],
    'slide-out-bottom': [
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(0, 100%, 0)'
        }
    ],
    'slide-out-left': [
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(-100%, 0, 0)'
        }
    ],
    'slide-out-right': [
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(100%, 0, 0)'
        }
    ],
    'flip-x': [
        {
            transform: 'perspective(400px) rotate3d(1, 0, 0, 90deg)',
            opacity: 0
        },
        {
            transform: 'perspective(400px) rotate3d(1, 0, 0, 0deg)',
            opacity: 1
        }
    ],
    'flip-y': [
        {
            transform: 'perspective(400px) rotate3d(0, 1, 0, 90deg)',
            opacity: 0
        },
        {
            transform: 'perspective(400px) rotate3d(0, 1, 0, 0deg)',
            opacity: 1
        }
    ],
    'perspective-pop': [
        {
            transform: 'perspective(600px) translateZ(-100px)',
            opacity: 0
        },
        {
            transform: 'perspective(600px) translateZ(0)',
            opacity: 1
        }
    ],
    // Fallbacks — dynamically replaced with scrollHeight/Width in _getKeyframes
    'expand-vertical': [
        {
            maxHeight: '0px',
            opacity: 0,
            overflow: 'hidden'
        },
        {
            maxHeight: '100vh',
            opacity: 1,
            overflow: 'hidden'
        }
    ],
    'collapse-vertical': [
        {
            maxHeight: '100vh',
            opacity: 1,
            overflow: 'hidden'
        },
        {
            maxHeight: '0px',
            opacity: 0,
            overflow: 'hidden'
        }
    ],
    'expand-horizontal': [
        {
            maxWidth: '0px',
            opacity: 0,
            overflow: 'hidden'
        },
        {
            maxWidth: '100vw',
            opacity: 1,
            overflow: 'hidden'
        }
    ],
    'collapse-horizontal': [
        {
            maxWidth: '100vw',
            opacity: 1,
            overflow: 'hidden'
        },
        {
            maxWidth: '0px',
            opacity: 0,
            overflow: 'hidden'
        }
    ],
    'pulse': [
        {
            transform: 'scale3d(1, 1, 1)'
        },
        {
            transform: 'scale3d(1.05, 1.05, 1.05)'
        },
        {
            transform: 'scale3d(1, 1, 1)'
        }
    ],
    'bounce': [
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(0, -12px, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(0, -6px, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'shake': [
        {
            transform: 'translate3d(0, 0, 0)'
        },
        {
            transform: 'translate3d(-4px, 0, 0)'
        },
        {
            transform: 'translate3d(4px, 0, 0)'
        },
        {
            transform: 'translate3d(-4px, 0, 0)'
        },
        {
            transform: 'translate3d(0, 0, 0)'
        }
    ],
    'wobble': [
        {
            transform: 'translate3d(0, 0, 0) rotate(0deg)'
        },
        {
            transform: 'translate3d(-15%, 0, 0) rotate(-4deg)'
        },
        {
            transform: 'translate3d(12%, 0, 0) rotate(3deg)'
        },
        {
            transform: 'translate3d(-9%, 0, 0) rotate(-2deg)'
        },
        {
            transform: 'translate3d(6%, 0, 0) rotate(1deg)'
        },
        {
            transform: 'translate3d(0, 0, 0) rotate(0deg)'
        }
    ],
    'heartbeat': [
        {
            transform: 'scale(1)'
        },
        {
            transform: 'scale(1.15)'
        },
        {
            transform: 'scale(1)'
        },
        {
            transform: 'scale(1.15)'
        },
        {
            transform: 'scale(1)'
        }
    ],
    'shimmer': [
        {
            backgroundPosition: '-200% 0'
        },
        {
            backgroundPosition: '200% 0'
        }
    ]
};
const EXPAND_COLLAPSE_PRESETS = new Set([
    'expand-vertical',
    'collapse-vertical',
    'expand-horizontal',
    'collapse-horizontal'
]);

export { EXIT_COUNTERPART as E, PRESET_KEYFRAMES as P, EXPAND_COLLAPSE_PRESETS as a };
