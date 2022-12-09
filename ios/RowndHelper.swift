//
//  RowndHelper.swift
//  rownd-react-native
//
//  Created by Michael Murray on 11/4/22.
//
import Foundation
import Rownd
import Lottie

extension UIViewController {
    var colorScheme: UIUserInterfaceStyle {
        if #available(iOS 13.0, *) {
            return self.traitCollection.userInterfaceStyle
        }
        else {
            return UIUserInterfaceStyle.unspecified
        }
    }

}

class AppCustomizations : RowndCustomizations {
    override var sheetBackgroundColor: UIColor {
        if let color = reactNativeSheetBackgroundColor {
            return color
        }
        switch(UIViewController().colorScheme) {
        case .light, .unspecified:
            return .white
        case .dark:
            return .systemGray6
        @unknown default:
            return .white
        }
    }
    open var reactNativeSheetBackgroundColor: UIColor? = nil
}


func colorWithHexString(hexString: String, alpha:CGFloat = 1.0) -> UIColor {
        // Convert hex string to an integer
        let hexint = Int(intFromHexString(hexStr: hexString))
        let red = CGFloat((hexint & 0xff0000) >> 16) / 255.0
        let green = CGFloat((hexint & 0xff00) >> 8) / 255.0
        let blue = CGFloat((hexint & 0xff) >> 0) / 255.0

        // Create color object, specifying alpha as well
        let color = UIColor(red: red, green: green, blue: blue, alpha: alpha)
        return color
}

func intFromHexString(hexStr: String) -> UInt32 {
        var hexInt: UInt32 = 0
        // Create scanner
        let scanner: Scanner = Scanner(string: hexStr)
        // Tell scanner to skip the # character
        scanner.charactersToBeSkipped = CharacterSet(charactersIn: "#")
        // Scan hex value
        hexInt = UInt32(bitPattern: scanner.scanInt32(representation: .hexadecimal) ?? 0)
        return hexInt
}
