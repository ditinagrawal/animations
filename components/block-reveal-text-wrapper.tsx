// Import the useGSAP hook from GSAP's React integration library
// This hook allows us to use GSAP animations within React components
import { useGSAP } from "@gsap/react"
// Import the main GSAP library for creating animations and timelines
import gsap from "gsap"
// Import ScrollTrigger plugin to trigger animations based on scroll position
import { ScrollTrigger } from "gsap/ScrollTrigger"
// Import SplitText plugin to split text into individual lines for animation
import { SplitText } from "gsap/SplitText"
// Import useRef hook from React to create references to DOM elements
import { useRef } from "react"

// Register GSAP plugins so they can be used throughout the application
// ScrollTrigger: Enables scroll-based animation triggers
// SplitText: Enables text splitting functionality
gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * BlockRevealTextWrapper Component
 *
 * A React component that creates a block reveal animation effect for text.
 * The animation reveals text line by line using a colored block that slides
 * across each line, creating a "wipe" or "reveal" effect.
 *
 * @param children - The text content to be animated (React.ReactNode)
 * @param animateOnScroll - Whether to trigger animation on scroll (default: true)
 *                         If true, animation starts when component enters viewport
 *                         If false, animation starts immediately on mount
 * @param delay - Base delay in seconds before animation starts (default: 0)
 * @param blockColor - Color of the reveal block (default: "#000" - black)
 * @param stagger - Additional delay between each line animation in seconds (default: 0.15)
 *                 This creates a cascading effect where lines animate one after another
 * @param duration - Duration of each block reveal animation in seconds (default: 0.75)
 */
export const BlockRevealTextWrapper = ({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#000",
  stagger = 0.15,
  duration = 0.75,
}: {
  children: React.ReactNode
  animateOnScroll?: boolean
  delay?: number
  blockColor?: string
  stagger?: number
  duration?: number
}) => {
  // Reference to the container div that wraps the children
  // This is used to access the DOM element for animation setup
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Reference to store SplitText instances
  // SplitText creates instances that need to be reverted on cleanup
  const splitRef = useRef<any[]>([])

  // Reference to store all line elements created by SplitText
  // These are the individual line elements that will be animated
  const lines = useRef<HTMLElement[]>([])

  // Reference to store all block revealer divs
  // These are the colored blocks that slide across to reveal the text
  const blocks = useRef<HTMLDivElement[]>([])

  // useGSAP hook runs the animation setup code
  // It automatically handles cleanup and re-runs when dependencies change
  useGSAP(
    () => {
      // Early return if container ref is not available
      // This prevents errors during initial render or unmount
      if (!containerRef.current) return

      // Reset all refs to empty arrays
      // This ensures clean state on re-renders or dependency changes
      splitRef.current = []
      lines.current = []
      blocks.current = []

      // Determine which elements to animate
      // If the container has the data attribute, animate each child separately
      // Otherwise, animate the container itself as a single element
      let elements = []
      if (containerRef.current.hasAttribute("data-block-reveal-text-wrapper")) {
        // Get all direct children of the container
        elements = Array.from(containerRef.current.children)
      } else {
        // Use the container itself as the element to animate
        elements = [containerRef.current]
      }

      // Process each element to split text into lines and create reveal blocks
      elements.forEach((element) => {
        // Split the text content into individual lines using SplitText
        // type: "lines" - splits text by line breaks
        // linesClass: "block-line++" - adds CSS class "block-line" with incrementing number
        //                            (e.g., block-line1, block-line2, etc.)
        const split = SplitText.create(element, {
          type: "lines",
          linesClass: "block-line++",
        })

        // Store the SplitText instance for cleanup later
        splitRef.current.push(split)

        // Process each line created by SplitText
        split.lines.forEach((line) => {
          // Create a wrapper div for each line
          // This wrapper will contain both the line text and the reveal block
          const wrapper = document.createElement("div")
          wrapper.className = "block-line-wrapper"

          // Insert the wrapper before the line in the DOM
          // Then move the line inside the wrapper
          // This preserves the DOM structure while allowing us to add the block
          line.parentNode?.insertBefore(wrapper, line)
          wrapper.appendChild(line)

          // Create the reveal block element
          // This is the colored div that will slide across to reveal the text
          const block = document.createElement("div")
          block.className = "block-revealer"
          // Set the background color of the block to the specified color
          block.style.backgroundColor = blockColor
          // Add the block to the wrapper (it will be positioned to cover the line)
          wrapper.appendChild(block)

          // Store references to the line and block for animation
          lines.current.push(line as HTMLElement)
          blocks.current.push(block)
        })
      })

      // Set initial state for all lines and blocks before animation
      // Lines start invisible (opacity: 0) - they'll be revealed as blocks slide away
      gsap.set(lines.current, { opacity: 0 })
      // Blocks start with scaleX: 0 (completely collapsed horizontally)
      // transformOrigin: "left center" means scaling happens from the left edge
      // This makes the block appear to slide in from the left
      gsap.set(blocks.current, { scaleX: 0, transformOrigin: "left center" })

      /**
       * Creates a block reveal animation timeline for a single line
       *
       * The animation sequence:
       * 1. Block scales from 0 to 1 (slides in from left, covering the line)
       * 2. Line opacity set to 1 (text becomes visible)
       * 3. Transform origin changed to right (for sliding out)
       * 4. Block scales from 1 to 0 (slides out to right, revealing the line)
       *
       * @param block - The reveal block element to animate
       * @param line - The text line element to reveal
       * @param index - The index of this line (used for stagger timing)
       * @returns A GSAP timeline containing the animation sequence
       */
      const createBlockRevealAnimation = (
        block: HTMLElement,
        line: HTMLElement,
        index: number,
      ) => {
        // Create a timeline with a delay based on:
        // - Base delay prop
        // - Line index (for stagger effect)
        // - Stagger amount (additional delay per line)
        const tl = gsap.timeline({ delay: delay + index + stagger })

        // Step 1: Block slides in from left (scaleX goes from 0 to 1)
        // This covers the text line with the colored block
        tl.to(block, { scaleX: 1, duration: duration, ease: "power4.inOut" })

        // Step 2: Make the text line visible
        // The text is now visible but still covered by the block
        tl.set(line, { opacity: 1 })

        // Step 3: Change transform origin to right side
        // This allows the block to slide out to the right
        tl.set(block, { transformOrigin: "right center" })

        // Step 4: Block slides out to right (scaleX goes from 1 to 0)
        // This reveals the text line underneath
        tl.to(block, { scaleX: 0, duration: duration, ease: "power4.inOut" })

        return tl
      }

      // Check if animation should be triggered on scroll or immediately
      if (animateOnScroll) {
        // Scroll-triggered animation mode
        // Each line gets its own animation that starts when the container enters viewport
        blocks.current.forEach((block, index) => {
          // Create the animation timeline for this line
          const tl = createBlockRevealAnimation(
            block,
            lines.current[index],
            index,
          )
          // Pause the timeline initially - it will play when triggered by scroll
          tl.pause()

          // Create a ScrollTrigger that watches the container
          ScrollTrigger.create({
            trigger: containerRef.current, // Element to watch for scroll position
            start: "top 90%", // Animation starts when top of container reaches 90% of viewport
            once: true, // Only trigger once (don't re-trigger on scroll up/down)
            onEnter: () => tl.play(), // Play the animation when trigger condition is met
          })
        })
      } else {
        // Immediate animation mode
        // Animations start as soon as the component mounts
        blocks.current.forEach((block, index) => {
          // Create and immediately start the animation timeline
          // No pause() call, so it starts right away
          const tl = createBlockRevealAnimation(
            block,
            lines.current[index],
            index,
          )
          // Timeline plays automatically since it wasn't paused
        })
      }

      // Cleanup function returned from useGSAP
      // This runs when the component unmounts or dependencies change
      return () => {
        // Revert all SplitText instances
        // This restores the original DOM structure before SplitText modified it
        splitRef.current.forEach((split) => split.revert())

        // Find all wrapper divs we created
        const wrappers = containerRef.current?.querySelectorAll(
          ".block-line-wrapper",
        )

        // Remove wrappers and restore original DOM structure
        wrappers?.forEach((wrapper) => {
          // Check that wrapper has a parent and a first child
          if (wrapper.parentNode && wrapper.firstChild) {
            // Move the first child (the line element) back to its original position
            // Insert it before the wrapper in the parent
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper)
            // Remove the now-empty wrapper div
            wrapper.remove()
          }
        })
      }
    },
    {
      // Scope the GSAP context to the container ref
      // This helps with cleanup and prevents memory leaks
      scope: containerRef,
      // Dependencies array - animation setup re-runs when these values change
      // This ensures animations update if props change
      dependencies: [animateOnScroll, delay, blockColor, stagger, duration],
    },
  )

  // Return the wrapper div with the container ref
  // The data attribute helps identify this element in the animation setup
  return (
    <div ref={containerRef} data-block-reveal-text-wrapper="true">
      {children}
    </div>
  )
}
