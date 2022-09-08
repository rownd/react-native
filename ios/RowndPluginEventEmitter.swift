import Rownd
import SwiftUI
import React

@objc(RowndPluginEventEmitter)
class RowndPluginEventEmitter: RCTEventEmitter {
    
    public static var emitter: RCTEventEmitter!

    override init() {
        super.init()
        RowndPluginEventEmitter.emitter = self
    }

    open override func supportedEvents() -> [String] {
      ["update_state","onReady", "onPending", "onFailure"]      // etc.
    }
  }

