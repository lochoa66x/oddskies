type GeoPoint = readonly [number, number];

type MapShape = {
  className: string;
  name: string;
  points: readonly GeoPoint[];
};

const landmasses: readonly MapShape[] = [
  {
    className: "atlas-landmass-main",
    name: "North America",
    points: [
      [-168, 70],
      [-150, 72],
      [-132, 63],
      [-123, 50],
      [-113, 49],
      [-103, 53],
      [-90, 50],
      [-78, 53],
      [-61, 49],
      [-52, 42],
      [-64, 36],
      [-76, 40],
      [-81, 31],
      [-80, 25],
      [-95, 24],
      [-101, 18],
      [-107, 23],
      [-114, 31],
      [-124, 38],
      [-132, 50],
      [-148, 60],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Central America",
    points: [
      [-101, 20],
      [-92, 18],
      [-87, 15],
      [-82, 10],
      [-76, 9],
      [-80, 14],
      [-88, 17],
      [-96, 21],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "South America",
    points: [
      [-81, 10],
      [-69, 10],
      [-55, 2],
      [-42, -8],
      [-36, -20],
      [-45, -34],
      [-52, -49],
      [-63, -55],
      [-70, -43],
      [-73, -29],
      [-78, -13],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Greenland",
    points: [
      [-53, 82],
      [-32, 78],
      [-22, 68],
      [-36, 60],
      [-50, 62],
      [-62, 71],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Europe",
    points: [
      [-11, 58],
      [-4, 64],
      [11, 67],
      [25, 63],
      [32, 56],
      [29, 48],
      [18, 45],
      [6, 43],
      [-5, 48],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Africa",
    points: [
      [-17, 34],
      [4, 37],
      [24, 32],
      [35, 18],
      [43, 4],
      [37, -13],
      [29, -31],
      [18, -35],
      [6, -28],
      [-7, -15],
      [-15, 6],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Asia",
    points: [
      [29, 70],
      [47, 66],
      [61, 62],
      [78, 67],
      [100, 62],
      [123, 58],
      [146, 51],
      [166, 42],
      [158, 29],
      [140, 22],
      [123, 15],
      [109, 5],
      [97, 8],
      [87, 21],
      [76, 18],
      [69, 27],
      [57, 31],
      [48, 24],
      [40, 31],
      [34, 43],
      [28, 51],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Arabian Peninsula",
    points: [
      [36, 31],
      [50, 29],
      [58, 20],
      [54, 12],
      [45, 12],
      [39, 18],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "India",
    points: [
      [72, 23],
      [88, 21],
      [89, 8],
      [79, 6],
      [72, 15],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Southeast Asia",
    points: [
      [96, 20],
      [108, 17],
      [118, 9],
      [114, 0],
      [103, 3],
    ],
  },
  {
    className: "atlas-landmass-main",
    name: "Australia",
    points: [
      [113, -11],
      [126, -16],
      [144, -12],
      [154, -25],
      [149, -37],
      [133, -39],
      [118, -33],
      [112, -22],
    ],
  },
  {
    className: "atlas-island",
    name: "United Kingdom",
    points: [
      [-7, 58],
      [1, 55],
      [-1, 50],
      [-7, 50],
    ],
  },
  {
    className: "atlas-island",
    name: "Ireland",
    points: [
      [-10, 55],
      [-7, 53],
      [-8, 51],
      [-11, 52],
    ],
  },
  {
    className: "atlas-island",
    name: "Japan",
    points: [
      [137, 45],
      [143, 42],
      [141, 34],
      [134, 33],
      [132, 38],
    ],
  },
  {
    className: "atlas-island",
    name: "Madagascar",
    points: [
      [47, -13],
      [51, -20],
      [49, -27],
      [44, -25],
      [44, -17],
    ],
  },
  {
    className: "atlas-island",
    name: "New Zealand North",
    points: [
      [172, -35],
      [178, -38],
      [175, -42],
      [170, -40],
    ],
  },
  {
    className: "atlas-island",
    name: "New Zealand South",
    points: [
      [166, -42],
      [174, -44],
      [171, -47],
      [164, -46],
    ],
  },
];

const coastDetails: readonly GeoPoint[][] = [
  [
    [-126, 49],
    [-112, 48],
    [-97, 49],
    [-82, 45],
    [-70, 46],
  ],
  [
    [-118, 33],
    [-103, 31],
    [-93, 29],
    [-82, 28],
  ],
  [
    [-74, -8],
    [-63, -17],
    [-57, -29],
    [-61, -43],
  ],
  [
    [-6, 51],
    [8, 50],
    [19, 53],
    [29, 57],
  ],
  [
    [5, 32],
    [17, 27],
    [29, 18],
    [34, 6],
    [30, -18],
  ],
  [
    [48, 53],
    [68, 50],
    [87, 45],
    [109, 36],
    [127, 33],
  ],
  [
    [70, 28],
    [84, 24],
    [100, 18],
    [112, 9],
  ],
  [
    [116, -23],
    [133, -27],
    [150, -30],
  ],
];

export function WorldMapBase({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`atlas-map-base ${className}`}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 1000 500"
    >
      <g className="atlas-graticule">
        <path d="M0 166.7H1000" />
        <path d="M0 250H1000" />
        <path d="M0 333.3H1000" />
        <path d="M250 0V500" />
        <path d="M500 0V500" />
        <path d="M750 0V500" />
      </g>

      <g>
        {landmasses.map((shape) => (
          <path
            className={shape.className}
            d={geoPath(shape.points)}
            key={shape.name}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      <g className="atlas-coast-detail">
        {coastDetails.map((points, index) => (
          <path
            d={geoLine(points)}
            key={index}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      <path
        className="atlas-antarctic-edge"
        d="M50 456C168 444 282 452 391 458C510 465 628 445 748 455C841 462 919 454 970 445"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function geoPath(points: readonly GeoPoint[]) {
  return `${geoLine(points)}Z`;
}

function geoLine(points: readonly GeoPoint[]) {
  return points
    .map(([longitude, latitude], index) => {
      const { x, y } = project(longitude, latitude);

      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function project(longitude: number, latitude: number) {
  return {
    x: ((longitude + 180) / 360) * 1000,
    y: ((90 - latitude) / 180) * 500,
  };
}
