/**
 * Tool Interface
 *
 * A tool is a named, stateless, deterministic capability an agent explicitly
 * declares ownership of. Tools never call other tools; agents coordinate tool
 * usage themselves (in postProcess()).
 */

export interface Tool {
  name: string;
  description: string;
}
