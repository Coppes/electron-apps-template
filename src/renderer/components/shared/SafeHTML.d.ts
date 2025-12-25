/**
 * SafeHTML Component
 */
declare function SafeHTML({ html, allowedTags, allowedAttributes, className }: {
    html: any;
    allowedTags?: string[];
    allowedAttributes?: {
        a: string[];
        img: string[];
        '*': string[];
    };
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
declare namespace SafeHTML {
    var propTypes: {
        html: any;
        allowedTags: any;
        allowedAttributes: any;
        className: any;
    };
}
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
