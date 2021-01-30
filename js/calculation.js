// class Point {
//   constructor(x, y = null) {
//     if (y == null) {
//       this.x = x.x;
//       this.y = x.y;
//     } else {
//       this.x = x;
//       this.y = y;
//     }
//   }
//   copy() {
//     return new Point(this.x, this.y);
//   }
//   distance(p2) {
//     return magnitude(p2.x - this.x, p2.y - this.y);
//   }
//   json() {
//     return {
//       x: this.x,
//       y: this.y,
//     };
//   }
// }

// class Line {
//   constructor(x1, y1 = null, x2 = null, y2 = null) {
//     if (y1 == null) {
//       this.x1 = x1.x1;
//       this.y1 = x1.y1;
//       this.x2 = x1.x2;
//       this.y2 = x1.y2;
//     } else {

//     }
//   }
// }

function intersectionLineLine(line1, line2) {
  return intersectionLineLinePoints(
    line1.x1,
    line1.y1,
    line1.x2,
    line1.y2,
    line2.x1,
    line2.y1,
    line2.x2,
    line2.y2
  );
}

function intersectionLineLinePoints(
  p0_x,
  p0_y,
  p1_x,
  p1_y,
  p2_x,
  p2_y,
  p3_x,
  p3_y
) {
  let s1_x, s1_y, s2_x, s2_y;
  s1_x = p1_x - p0_x;
  s1_y = p1_y - p0_y;
  s2_x = p3_x - p2_x;
  s2_y = p3_y - p2_y;

  let s, t;
  s =
    (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
    (-s2_x * s1_y + s1_x * s2_y);
  t =
    (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
    (-s2_x * s1_y + s1_x * s2_y);
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      x: p0_x + t * s1_x,
      y: p0_y + t * s1_y,
    };
  }

  return null; // No collision
}

function pointDistance(p1, p2) {
  return distance(p1.x, p1.y, p2.x, p2.y);
}

function distance(p1_x, p1_y, p2_x, p2_y) {
  return magnitude(p2_x - p1_x, p2_y - p1_y);
}

function pointMagnitude(p) {
  return magnitude(p.x, p.y);
}

function magnitude(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function raycast(source, angle, reach, lines) {
  let targetPoint = {
    x: source.x + reach * Math.cos(angle),
    y: source.y + reach * Math.sin(angle),
  };
  let rayCastLine = {
    x1: source.x,
    y1: source.y,
    x2: targetPoint.x,
    y2: targetPoint.y,
  };
  let points = [];
  let distances = [];
  for (let targetLine of lines) {
    let check = intersectionLineLine(rayCastLine, targetLine);
    if (check) {
      points.push(check);
      distances.push(distance(source.x, source.y, check.x, check.y));
    }
  }
  if (points.length == 0) {
    return [targetPoint, distance];
  }
  return getClosest(points, distances);
}

function getClosest(points, distances) {
  let minIndex = 0;
  let minValue = distances[0];
  for (let j = 0; j < distances.length; ++j) {
    if (distances[j] < minValue) {
      minValue = distances[j];
      minIndex = j;
    }
  }
  return [points[minIndex], minValue];
}

function getClosestPoint(point, points) {
  let distances = new Array(points.length);
  for (let i = 0; i < points.length; ++i) {
    distances[i] = pointDistance(point, points[i]);
  }
  return getClosest(points, distances)[0];
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function reverseSigmoid(x) {
  return 1 - sigmoid(x);
}

function pointAngle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
