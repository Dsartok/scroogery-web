/**
 * Arc in diagram
 */
export type DiagramArc = {
  /**
   * Arc name
   */
  name: string;
  /**
   * x position of arc
   */
  x: number;
  /**
   * y position of arc
   */
  y: number;
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
  /**
   * use full arc fill or just stroke
   */
  isFull?: boolean;
};
