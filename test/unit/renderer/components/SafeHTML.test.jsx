import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SafeHTML from '../../../../src/renderer/components/shared/SafeHTML';

describe('SafeHTML Component', () => {
  beforeEach(() => {
    // Clean up any test DOM elements
    document.body.innerHTML = '';
  });

  it('should render safe HTML content', () => {
    const safeHTML = '<p>Hello <strong>World</strong></p>';
    
    render(<SafeHTML html={safeHTML} />);

    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
    expect(screen.getByText(/World/i)).toBeInTheDocument();
  });

  it('should remove script tags', () => {
    const dangerousHTML = '<p>Safe content</p><script>alert("XSS")</script>';
    
    const { container } = render(<SafeHTML html={dangerousHTML} />);

    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText(/Safe content/i)).toBeInTheDocument();
  });

  it('should remove onclick attributes', () => {
    const dangerousHTML = '<button onclick="alert(\'XSS\')">Click me</button>';
    
    const { container } = render(<SafeHTML html={dangerousHTML} />);

    const button = container.querySelector('button');
    if (button) {
      expect(button.hasAttribute('onclick')).toBe(false);
    }
  });

  it('should remove iframe tags', () => {
    const dangerousHTML = '<p>Content</p><iframe src="evil.com"></iframe>';
    
    const { container } = render(<SafeHTML html={dangerousHTML} />);

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText(/Content/i)).toBeInTheDocument();
  });

  it('should allow safe tags from allowedTags', () => {
    const html = '<p>Paragraph</p><em>Emphasis</em><strong>Strong</strong>';
    
    render(<SafeHTML html={html} />);

    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Emphasis')).toBeInTheDocument();
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('should allow links with safe attributes', () => {
    const html = '<a href="https://example.com" title="Example">Link</a>';
    
    const { container } = render(<SafeHTML html={html} />);

    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('title')).toBe('Example');
  });

  it('should allow images with safe attributes', () => {
    const html = '<img src="image.jpg" alt="Test Image" width="100" height="100" />';
    
    const { container } = render(<SafeHTML html={html} />);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('image.jpg');
    expect(img?.getAttribute('alt')).toBe('Test Image');
  });

  it('should handle empty HTML', () => {
    const { container } = render(<SafeHTML html="" />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should handle null HTML', () => {
    const { container } = render(<SafeHTML html={null} />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should handle undefined HTML', () => {
    const { container } = render(<SafeHTML html={undefined} />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should use custom className when provided', () => {
    const html = '<p>Content</p>';
    
    const { container } = render(<SafeHTML html={html} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should strip dangerous event handlers', () => {
    const html = '<div onload="alert(\'XSS\')" onmouseover="alert(\'XSS\')" onfocus="alert(\'XSS\')">Content</div>';
    
    const { container } = render(<SafeHTML html={html} />);

    const div = container.querySelector('div[onload]');
    expect(div).toBeNull();
  });

  it('should handle nested HTML structures', () => {
    const html = `
      <div>
        <h1>Title</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `;
    
    render(<SafeHTML html={html} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText(/Paragraph with/i)).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should remove form elements', () => {
    const html = '<form><input type="text" /><button>Submit</button></form>';
    
    const { container } = render(<SafeHTML html={html} />);

    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input')).toBeNull();
  });

  it('should preserve text content when removing dangerous tags', () => {
    const html = '<p>Safe</p><script>alert("Dangerous")</script><p>More Safe</p>';
    
    render(<SafeHTML html={html} />);

    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.getByText('More Safe')).toBeInTheDocument();
  });
});
