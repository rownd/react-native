require "json"

unless defined?(install_modules_dependencies)
  absolute_react_native_path = File.dirname(`node --print "require.resolve('react-native/package.json')"`)
  require File.join(absolute_react_native_path, "scripts/react_native_pods")
end

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "rownd-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "14.0" }
  s.source       = { :git => "https://rownd.io/.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"
  s.dependency "Rownd", "~> 3.14.6"
  s.dependency "lottie-ios", "~> 4.5.0"

  # Use install_modules_dependencies to properly handle New Architecture dependencies
  # See: https://github.com/react-native-community/discussions-and-proposals/discussions/912
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig = {
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
      "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    install_modules_dependencies(s)
  end
end
