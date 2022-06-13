import * as React from 'react';
import Svg, { SvgProps, Defs, Path, Polygon, Rect } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: style */

const SvgComponent = (props: SvgProps) => (
  <Svg
    id="icon"
    // @ts-ignore
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    viewBox="0 0 32 32"
    {...props}
  >
    <Defs />
    <Path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z" />
    <Polygon
      id="inner-path"
      points="14 21.591 9 16.591 10.591 15 14 18.409 21.41 11 23.005 12.585 14 21.591"
    />
    <Rect
      id="_Transparent_Rectangle_"
      data-name="&lt;Transparent Rectangle&gt;"
      width={32}
      height={32}
    />
  </Svg>
);

export default SvgComponent;
