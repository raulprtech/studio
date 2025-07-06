import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Logo } from '@/components/logo';

describe('Logo', () => {
  it('debería renderizar el componente SVG', () => {
    const { container } = render(<Logo />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('debería tener la clase "text-primary" por defecto', () => {
    const { container } = render(<Logo />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toHaveClass('text-primary');
  });
});
