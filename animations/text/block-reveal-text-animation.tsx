import { BlockRevealTextWrapper } from "@/components/block-reveal-text-wrapper"

import "./block-reveal-text-animation.css"

export const BlockRevealTextAnimation = () => {
  return (
    <div>
      <div className="flex h-screen items-center justify-center">
        <BlockRevealTextWrapper animateOnScroll={false}>
          <p className="max-w-5xl text-5xl font-semibold tracking-tight">
            Discover how stunning animations elevate web experiences, making
            interactions vibrant and memorable. Animations not only attract
            users but also guide them intuitively through interfaces.
          </p>
        </BlockRevealTextWrapper>
      </div>
      <div className="flex h-screen items-center justify-center">
        <BlockRevealTextWrapper>
          <p className="max-w-5xl text-5xl font-semibold tracking-tight">
            With the right animation tools, developers can boost usability and
            craft delightful moments. Unlock the secrets to impactful web
            animations and transform user journeys today.
          </p>
        </BlockRevealTextWrapper>
      </div>
    </div>
  )
}
