import React from 'react';
import PropTypes from 'prop-types';

/**
 * Secure HTML Renderer Component
 * Safely renders HTML content with XSS protection
 * 
 * Security features:
 * - Sanitizes HTML before rendering
 * - Removes dangerous tags and attributes
 * - Prevents script injection
 * - Configurable allowed tags
 * 
 * Note: This is a basic implementation. For production use, consider:
 * - DOMPurify library for robust HTML sanitization
 * - Marked library with sanitization for Markdown
 * 
 * @example
 * <SafeHTML html={userContent} />
 * <SafeHTML html={userContent} allowedTags={['p', 'strong', 'em']} />
 */

/**
 * Default allowed HTML tags (safe subset)
 */
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote',
  'a', 'img', 'span', 'div',
];

/**
 * Default allowed attributes per tag
 */
const DEFAULT_ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  '*': ['class', 'id'], // Allowed on all tags
};

/**
 * Dangerous tags that should always be removed
 */
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'link', 'style',
  'form', 'input', 'button', 'textarea', 'select',
];

/**
 * Dangerous attributes that should always be removed
 */
const DANGEROUS_ATTRIBUTES = [
  'onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur',
  'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
];

/**
 * Basic HTML sanitizer (production should use DOMPurify)
 * @param {string} html - HTML string to sanitize
 * @param {Array<string>} allowedTags - Allowed HTML tags
 * @param {Object} allowedAttributes - Allowed attributes per tag
 * @returns {string} Sanitized HTML
 */
function sanitizeHTML(html: string, allowedTags: string[], allowedAttributes: Record<string, string[]>) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Recursive function to sanitize nodes
  function sanitizeNode(node: Element) {
    // Remove dangerous tags
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      // Remove dangerous tags completely
      if (DANGEROUS_TAGS.includes(tagName)) {
        node.remove();
        return;
      }

      // Remove tags not in allowlist
      if (!allowedTags.includes(tagName)) {
        // Replace with text content
        const textNode = document.createTextNode(node.textContent || '');
        node.parentNode?.replaceChild(textNode, node);
        return;
      }

      // Sanitize attributes
      const attrs = Array.from(node.attributes);
      attrs.forEach(attr => {
        const attrName = attr.name.toLowerCase();

        // Remove dangerous attributes
        if (DANGEROUS_ATTRIBUTES.some(dangerous => attrName.startsWith(dangerous))) {
          node.removeAttribute(attr.name);
          return;
        }

        // Check if attribute is allowed
        const tagAllowed = allowedAttributes[tagName] || [];
        const globalAllowed = allowedAttributes['*'] || [];

        if (!tagAllowed.includes(attrName) && !globalAllowed.includes(attrName)) {
          node.removeAttribute(attr.name);
        }

        // Sanitize href and src attributes
        if (attrName === 'href' || attrName === 'src') {
          const value = attr.value.toLowerCase();
          // Block javascript:, data:, vbscript:, etc.
          if (
            value.startsWith('javascript:') ||
            value.startsWith('data:') ||
            value.startsWith('vbscript:') ||
            value.startsWith('file:')
          ) {
            node.removeAttribute(attr.name);
          }
        }
      });

      // Add rel="noopener noreferrer" to external links for security
      if (tagName === 'a' && node.hasAttribute('href')) {
        const href = node.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      }
    }

    // Recursively sanitize children
    Array.from(node.childNodes).forEach(child => sanitizeNode(child as Element));
  }

  sanitizeNode(temp);
  return temp.innerHTML;
}

/**
 * SafeHTML Component
 */
interface SafeHTMLProps {
  html: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  className?: string;
}

function SafeHTML({ html, allowedTags = DEFAULT_ALLOWED_TAGS, allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES, className = '' }: SafeHTMLProps) {
  const sanitized = sanitizeHTML(html, allowedTags, allowedAttributes);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

SafeHTML.propTypes = {
  html: PropTypes.string.isRequired,
  allowedTags: PropTypes.arrayOf(PropTypes.string),
  allowedAttributes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  className: PropTypes.string,
};

export default SafeHTML;

/**
 * Usage recommendation for production:
 * 
 * Install DOMPurify:
 * npm install dompurify
 * npm install --save-dev @types/dompurify
 * 
 * Then use:
 * import DOMPurify from 'dompurify';
 * 
 * function SafeHTML({ html }) {
 *   const clean = DOMPurify.sanitize(html, {
 *     ALLOWED_TAGS: ['p', 'strong', 'em', ...],
 *     ALLOWED_ATTR: ['href', 'title', ...]
 *   });
 *   return <div dangerouslySetInnerHTML={{ __html: clean }} />;
 * }
 */
