/**
 * DocuFresh Library
 * Keep your documents fresh, automatically
 * @version 0.1.0
 */

class DocuFresh {
  constructor() {
    // Store all marker functions
    this.markers = this.getBuiltInMarkers();
  }

  /**
   * Main processing function
   * Replaces all {{markers}} in text with dynamic values
   * 
   * @param {string} text - Text containing markers
   * @param {Object} customData - Custom data for {{variable}} replacement
   * @returns {string} Processed text with markers replaced
   */
  process(text, customData = {}) {
    let result = text;
    
    // Step 1: Replace custom data markers like {{company_name}}
    result = this.replaceCustomData(result, customData);
    
    // Step 2: Replace built-in markers like {{current_year}}
    result = this.replaceBuiltInMarkers(result);
    
    return result;
  }

  /**
   * Replace custom data markers
   * Example: {{company_name}} with data = {company_name: "Acme"}
   */
  replaceCustomData(text, data) {
    let result = text;
    
    for (const [key, value] of Object.entries(data)) {
      // Create regex pattern to find {{key}}
      const pattern = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(pattern, String(value));
    }
    
    return result;
  }

  /**
   * Replace built-in markers
   * Handles both simple markers {{current_year}} and 
   * parameterized markers {{days_since:2024-01-01}}
   */
  replaceBuiltInMarkers(text) {
    let result = text;
    
    // Find all {{...}} patterns
    const markerPattern = /{{([^}]+)}}/g;
    const matches = [...text.matchAll(markerPattern)];
    
    for (const match of matches) {
      const fullMarker = match[0];        // "{{current_year}}"
      const markerContent = match[1];     // "current_year"
      
      // Split by : to get marker name and parameters
      const parts = markerContent.split(':');
      const markerName = parts[0].trim();
      // Join back params in case of colons (like in times), then split by comma for multiple args
      const paramString = parts.slice(1).join(':');
      const params = paramString ? paramString.split(',').map(p => p.trim()) : [];
      
      // Get the marker function
      const markerFn = this.markers[markerName];
      
      if (markerFn) {
        try {
          const replacement = markerFn(...params);
          result = result.replace(fullMarker, replacement);
        } catch (error) {
          console.error(`Error processing marker ${fullMarker}:`, error.message);
          // Leave marker unchanged if error
        }
      }
      // If marker not found, leave it as-is (fail silently)
    }
    
    return result;
  }

  /**
   * All built-in marker functions
   * Each function returns a string
   */
  getBuiltInMarkers() {
    return {
      // ============================================
      // DATE & TIME MARKERS
      // ============================================
      
      /**
       * Current year (4 digits)
       * Example: {{current_year}} → "2025"
       */
      current_year: () => {
        return new Date().getFullYear().toString();
      },
      
      /**
       * Current month name
       * Example: {{current_month}} → "January"
       */
      current_month: () => {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[new Date().getMonth()];
      },
      
      /**
       * Current date (localized)
       * Example: {{current_date}} → "1/15/2025"
       */
      current_date: () => {
        return new Date().toLocaleDateString();
      },
      
      /**
       * Current time (localized)
       * Example: {{current_time}} → "2:30:45 PM"
       */
      current_time: () => {
        return new Date().toLocaleTimeString();
      },
      
      /**
       * Days since a specific date
       * Example: {{days_since:2024-01-01}} → "380"
       */
      days_since: (dateString) => {
        const targetDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - targetDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays.toString();
      },
      
      /**
       * Days until a specific date
       * Example: {{days_until:2025-12-31}} → "350"
       */
      days_until: (dateString) => {
        const targetDate = new Date(dateString);
        const now = new Date();
        const diffTime = targetDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays.toString();
      },
      
      /**
       * Years since a date or year
       * Example: {{years_since:2020}} → "6"
       * Example: {{years_since:2020-01-01}} → "6"
       */
      years_since: (dateString) => {
        let targetYear;
        // If it's just a year (4 digits), use it directly
        if (/^\d{4}$/.test(dateString)) {
          targetYear = parseInt(dateString);
        } else {
          // Parse as date, using noon to avoid timezone issues
          const parts = dateString.split('-');
          if (parts.length >= 3) {
            targetYear = parseInt(parts[0]);
          } else {
            const targetDate = new Date(dateString);
            targetYear = targetDate.getFullYear();
          }
        }
        const now = new Date();
        const years = now.getFullYear() - targetYear;
        return years.toString();
      },
      
      /**
       * Calculate age from birthdate
       * Example: {{age:1995-06-15}} → "29"
       */
      age: (birthdate) => {
        const birth = new Date(birthdate);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDiff = now.getMonth() - birth.getMonth();
        
        // Adjust if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
          age--;
        }
        
        return age.toString();
      },
      
      /**
       * Relative time (human-friendly)
       * Example: {{relative_time:2024-12-01}} → "6 weeks ago"
       */
      relative_time: (dateString) => {
        const targetDate = new Date(dateString);
        const now = new Date();
        const diffTime = now - targetDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays === -1) return 'tomorrow';
        if (diffDays < 0) {
          const futureDays = Math.abs(diffDays);
          if (futureDays < 7) return `in ${futureDays} days`;
          if (futureDays < 30) return `in ${Math.floor(futureDays / 7)} weeks`;
          if (futureDays < 365) return `in ${Math.floor(futureDays / 30)} months`;
          return `in ${Math.floor(futureDays / 365)} years`;
        }
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      },
      
      /**
       * Unix timestamp (milliseconds)
       * Example: {{timestamp}} → "1705334445123"
       */
      timestamp: () => {
        return Date.now().toString();
      },
      
      // ============================================
      // MATH MARKERS
      // ============================================
      
      /**
       * Add numbers
       * Example: {{add:5,3,2}} → "10"
       */
      add: (...numbers) => {
        const sum = numbers.reduce((total, num) => total + parseFloat(num), 0);
        return sum.toString();
      },
      
      /**
       * Subtract (first - rest)
       * Example: {{subtract:10,3}} → "7"
       */
      subtract: (...numbers) => {
        if (numbers.length === 0) return '0';
        const result = numbers.reduce((total, num, index) => {
          if (index === 0) return parseFloat(num);
          return total - parseFloat(num);
        }, 0);
        return result.toString();
      },
      
      /**
       * Multiply numbers
       * Example: {{multiply:5,3,2}} → "30"
       */
      multiply: (...numbers) => {
        const product = numbers.reduce((total, num) => total * parseFloat(num), 1);
        return product.toString();
      },
      
      /**
       * Divide (first / rest)
       * Example: {{divide:10,2}} → "5"
       */
      divide: (...numbers) => {
        if (numbers.length === 0) return '0';
        const result = numbers.reduce((total, num, index) => {
          if (index === 0) return parseFloat(num);
          return total / parseFloat(num);
        }, 0);
        return result.toString();
      },
      
      // ============================================
      // RANDOM & UTILITY MARKERS
      // ============================================
      
      /**
       * Random number between min and max (inclusive)
       * Example: {{random:1,100}} → "42"
       */
      random: (min, max) => {
        const minNum = parseInt(min);
        const maxNum = parseInt(max);
        const random = Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
        return random.toString();
      },
      
      /**
       * Capitalize first letter
       * Example: {{capitalize:hello world}} → "Hello world"
       */
      capitalize: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      },
      
      /**
       * Convert to uppercase
       * Example: {{upper:hello}} → "HELLO"
       */
      upper: (text) => {
        return text.toUpperCase();
      },
      
      /**
       * Convert to lowercase
       * Example: {{lower:HELLO}} → "hello"
       */
      lower: (text) => {
        return text.toLowerCase();
      },
      
      /**
       * Format number with commas
       * Example: {{format_number:1000000}} → "1,000,000"
       */
      format_number: (num) => {
        return parseFloat(num).toLocaleString();
      }
    };
  }

  /**
   * Register a custom marker function
   * Allows users to add their own markers
   * 
   * @param {string} name - Marker name (used as {{name}})
   * @param {Function} fn - Function that returns a string
   */
  registerMarker(name, fn) {
    this.markers[name] = fn;
  }

  /**
   * Auto-update all markers in the DOM (browser only)
   * Scans page for {{markers}} and replaces them
   * 
   * @param {string} selector - CSS selector (default: 'body')
   * @param {Object} customData - Custom data for replacement
   */
  autoUpdate(selector = 'body', customData = {}) {
    // Only works in browser
    if (typeof document === 'undefined') {
      console.warn('autoUpdate() only works in browser environment');
      return;
    }
    
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element "${selector}" not found`);
      return;
    }
    
    // Walk through all text nodes and process them
    this.walkTextNodes(element, (node) => {
      const originalText = node.textContent;
      const updatedText = this.process(originalText, customData);
      
      if (originalText !== updatedText) {
        node.textContent = updatedText;
      }
    });
  }

  /**
   * Helper: Recursively walk through text nodes
   * @private
   */
  walkTextNodes(node, callback) {
    if (node.nodeType === 3) { // Text node
      if (node.textContent.includes('{{')) {
        callback(node);
      }
    } else {
      for (let child of node.childNodes) {
        this.walkTextNodes(child, callback);
      }
    }
  }
}

// ============================================
// EXPORT FOR DIFFERENT ENVIRONMENTS
// ============================================

// Create singleton instance
const docufresh = new DocuFresh();

// CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = docufresh;
  module.exports.DocuFresh = DocuFresh;
}

// Browser global
if (typeof window !== 'undefined') {
  window.DocuFresh = docufresh;
}

// ES6 modules (future-proofing)
if (typeof exports !== 'undefined') {
  exports.default = docufresh;
  exports.DocuFresh = DocuFresh;
}
