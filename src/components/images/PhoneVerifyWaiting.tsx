import * as React from 'react';
import Svg, { SvgProps, Defs, Rect, G, Use, Circle } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title, filter */

const SvgComponent = (props: SvgProps) => (
  <Svg
    width="62px"
    height="100px"
    viewBox="0 0 62 100"
    // @ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <Defs>
      <Rect id="path-1" x={0} y={0} width={58} height={96} rx={8} />
    </Defs>
    <G
      id="SMS-verify-from-web-stay-on-web-(BR)"
      stroke="none"
      strokeWidth={1}
      fill="none"
      fillRule="evenodd"
    >
      <G
        id="xlg-1312px-16-column-copy-51"
        transform="translate(-625.000000, -259.000000)"
      >
        <G id="unverified-phone" transform="translate(627.000000, 261.000000)">
          <G id="Rectangle">
            <Use
              fill="black"
              fillOpacity={1}
              // @ts-ignore
              filter="url(#filter-2)"
              xlinkHref="#path-1"
            />
            <Use fill="#444444" fillRule="evenodd" xlinkHref="#path-1" />
          </G>
          <Circle id="Oval" fill="#000000" cx={29} cy={89} r={5} />
          <Rect
            id="Rectangle"
            fill="#FFFFFF"
            x={5}
            y={11}
            width={48}
            height={71}
            rx={2}
          />
          <Rect
            id="Rectangle"
            fillOpacity={0.4}
            fill="#D8D8D8"
            x={10}
            y={20}
            width={38}
            height={5}
          />
          <Rect
            id="Rectangle-Copy"
            fillOpacity={0.4}
            fill="#D8D8D8"
            x={10}
            y={31}
            width={38}
            height={36}
          />
        </G>
      </G>
    </G>
  </Svg>
);

export default SvgComponent;
