import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export type ButtonVariant = "primary" | "line" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[image:var(--gradient-primary)] text-text-1 shadow-[var(--shadow-glow-primary)] hover:brightness-110 focus-visible:outline-primary",
  line: "bg-emerald-700 text-text-1 hover:bg-emerald-600 focus-visible:outline-emerald-700",
  ghost:
    "bg-transparent text-text-1 border border-border-strong hover:bg-surface-2 focus-visible:outline-primary-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3.5 text-lg",
};

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-button font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsInternalLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & {
    href: string;
    external?: false;
  };

type ButtonAsExternalLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps> & {
    href: string;
    external: true;
  };

export type ButtonProps =
  | ButtonAsButton
  | ButtonAsInternalLink
  | ButtonAsExternalLink;

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", icon, className, children } = props;
  const cn = classes(variant, size, className);

  if ("href" in props && props.href) {
    if ("external" in props && props.external) {
      const { href, external: _external, icon: _icon, variant: _v, size: _s, className: _c, ...rest } =
        props;
      void _external;
      void _icon;
      void _v;
      void _s;
      void _c;
      return (
        <a
          href={href}
          className={cn}
          target="_blank"
          rel="noopener noreferrer"
          {...(rest as ComponentPropsWithoutRef<"a">)}
        >
          {icon}
          {children}
        </a>
      );
    }

    const { href, icon: _icon, variant: _v, size: _s, className: _c, ...rest } =
      props as ButtonAsInternalLink;
    void _icon;
    void _v;
    void _s;
    void _c;

    if (href.startsWith("#")) {
      return (
        <a href={href} className={cn} {...(rest as ComponentPropsWithoutRef<"a">)}>
          {icon}
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={cn} {...rest}>
        {icon}
        {children}
      </Link>
    );
  }

  const { icon: _icon, variant: _v, size: _s, className: _c, ...rest } = props as ButtonAsButton;
  void _icon;
  void _v;
  void _s;
  void _c;
  return (
    <button className={cn} {...rest}>
      {icon}
      {children}
    </button>
  );
}
