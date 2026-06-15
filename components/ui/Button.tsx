import Link from "next/link";
import { cn } from "@/lib/utils";
import styles from "./Button.module.css";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  href?: string;
  variant?: "primary" | "secondary" | "portal" | "ghost";
  size?: "sm" | "md" | "lg";
}

const ghostClasses =
  "inline-flex items-center justify-center rounded-xl font-medium text-muted transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolt-glow/50 disabled:opacity-50";

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-[0.9375rem]",
};

const focusClasses =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolt-glow/40 disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "portal" && styles.portal,
    (variant === "primary" || variant === "secondary" || variant === "portal") &&
      styles[size],
    variant === "ghost" && ghostClasses,
    variant === "ghost" && sizeClasses[size],
    focusClasses,
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
