import onHeaders from 'on-headers';

/**
 * This ensures string can be "quotable", but more characters can be allowed.
 * Since the server timing header spec encourages description fields to be as
 * brief as possible, I think it's acceptable to use this constratined set of
 * characters.
 * https://httpwg.org/specs/rfc7230.html#rfc.section.3.2.6
 * https://w3c.github.io/server-timing/#the-server-timing-header-field
 * @param {string} string
 */
function filterQuotedString(string) {
  return string.replace(/[^\w\t ]/g, '');
}

export default function makeTimings() {
  /**
   * @param {import('http').IncomingMessage} _req
   * @param {import('http').ServerResponse} res
   * @this Map
   */
  function serverTimings(_req, res) {
    /** @type string[] */
    const timings = [];

    /** @param {{ name: string, description?:string, duration?: number }} options */
    this.timing = ({ name, description, duration }) => {
      if (!name || typeof name !== 'string') {
        throw new Error('A metric name is required for timings.');
      }

      let metric = name;

      if (typeof description === 'string') {
        const desc = filterQuotedString(description);

        if (desc) {
          metric += `;desc="${description}"`;
        }
      }

      if (Number.isFinite(duration)) {
        metric += `;dur=${duration}`;
      }

      timings.push(metric);
    };

    onHeaders(res, () => {
      if (timings.length) {
        res.setHeader('server-timing', timings);
      }
    });
  }

  return serverTimings;
}
