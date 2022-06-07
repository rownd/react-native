import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"

const SvgComponent = (props: SvgProps) => (
  <Svg viewBox="0 0 320 234" {...props}>
    <Path
      d="m-3 236 325 2 2-42c-55.333-56-101.333-96-138-120C149.388 52.036 87.055 26.702-1 0l-2 236Z"
      fill={props.fill}
      fillRule="evenodd"
      opacity={0.1}
    />
  </Svg>
)

export default SvgComponent
