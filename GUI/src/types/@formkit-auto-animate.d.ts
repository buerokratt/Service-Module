// Workaround for auto-animate bug: https://github.com/formkit/auto-animate/issues/150
// Without this, type checking fails
declare module '@formkit/auto-animate' {
  export default function autoAnimate(
    el: HTMLElement | null,
    options?: {
      duration?: number;
      easing?: string;
      ignore?: string;
    },
  ): void;
}
