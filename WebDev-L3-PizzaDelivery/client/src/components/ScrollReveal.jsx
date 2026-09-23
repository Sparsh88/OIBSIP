import React, { createContext, useContext } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

// Context for nested Stagger Container
const StaggerContext = createContext({
  isContainerVisible: false,
  staggerDelay: 0.12,
  initialDelay: 0,
  duration: 0.7,
  distance: 40,
  direction: 'up',
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
});

/**
 * ScrollReveal Component
 * Smoothly animates into view when scrolled into the viewport.
 */
export const ScrollReveal = ({
  children,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'
  distance = 40,
  duration = 0.7,
  delay = 0,
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  once = true,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}) => {
  const [ref, isVisible] = useScrollReveal({ threshold, rootMargin, once });

  // Calculate transform depending on direction
  const getTransform = (visible) => {
    if (visible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'scale':
        return 'scale(0.92)';
      case 'fade':
      default:
        return 'none';
    }
  };

  const dynamicStyle = {
    ...style,
    opacity: isVisible ? 1 : 0,
    transform: getTransform(isVisible),
    transition: `opacity ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s`,
    willChange: 'opacity, transform',
  };

  return (
    <Component
      ref={ref}
      className={`scroll-reveal-box ${className}`}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * StaggerContainer Component
 * Triggers a staggered reveal for all child StaggerItem elements when the container enters viewport.
 */
export const StaggerContainer = ({
  children,
  staggerDelay = 0.12,
  initialDelay = 0,
  duration = 0.7,
  distance = 40,
  direction = 'up',
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  once = true,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}) => {
  const [ref, isVisible] = useScrollReveal({ threshold, rootMargin, once });

  return (
    <StaggerContext.Provider
      value={{
        isContainerVisible: isVisible,
        staggerDelay,
        initialDelay,
        duration,
        distance,
        direction,
        easing,
      }}
    >
      <Component
        ref={ref}
        className={`stagger-reveal-container ${className}`}
        style={style}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;
          // If child is already a StaggerItem, pass the calculated index
          return React.cloneElement(child, {
            _index: index,
            ...child.props,
          });
        })}
      </Component>
    </StaggerContext.Provider>
  );
};

/**
 * StaggerItem Component
 * Automatically calculates staggered delay from parent StaggerContainer.
 */
export const StaggerItem = ({
  children,
  index,
  _index,
  delay: customDelay,
  direction: customDirection,
  distance: customDistance,
  duration: customDuration,
  easing: customEasing,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}) => {
  const context = useContext(StaggerContext);
  const itemIndex = index !== undefined ? index : (_index !== undefined ? _index : 0);

  const isVisible = context.isContainerVisible;
  const direction = customDirection || context.direction || 'up';
  const distance = customDistance !== undefined ? customDistance : (context.distance || 40);
  const duration = customDuration !== undefined ? customDuration : (context.duration || 0.7);
  const easing = customEasing || context.easing || 'cubic-bezier(0.16, 1, 0.3, 1)';
  const delay =
    customDelay !== undefined
      ? customDelay
      : (context.initialDelay || 0) + itemIndex * (context.staggerDelay || 0.12);

  const getTransform = (visible) => {
    if (visible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'scale':
        return 'scale(0.92)';
      case 'fade':
      default:
        return 'none';
    }
  };

  const dynamicStyle = {
    ...style,
    opacity: isVisible ? 1 : 0,
    transform: getTransform(isVisible),
    transition: `opacity ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s`,
    willChange: 'opacity, transform',
  };

  return (
    <Component
      className={`stagger-item ${className}`}
      style={dynamicStyle}
      {...props}
    >
      {children}
    </Component>
  );
};
