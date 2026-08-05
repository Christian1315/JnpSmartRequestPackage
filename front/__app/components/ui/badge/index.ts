import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-blue-100 text-blue-700 [a&]:hover:bg-blue-100/90",
        secondary:
          "border-transparent bg-yellow-100 text-yellow-700 [a&]:hover:bg-yellow-100/90",
        destructive:
          "border-transparent bg-red-100 text-red-700 [a&]:hover:bg-red-100/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-red-900/30",
        outline:
          "border-slate-200 bg-slate-100 text-slate-700 [a&]:hover:bg-slate-200 [a&]:hover:text-slate-800",
        success:
          "border-transparent bg-green-100 text-green-700 [a&]:hover:bg-green-100/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
