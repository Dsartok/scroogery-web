/**
 * Arc in diagram
 */
export type DiagramArc = {
  /**
   * Arc name
   */
  name: string;
  /**
   * radius of entire circle
   */
  radius: number;
  /**
   * angle where arc begins
   */
  startAngle: number;
  /**
   * angle where arc ends
   */
  endAngle: number;
  /**
   * arc color
   */
  color: string;
};
