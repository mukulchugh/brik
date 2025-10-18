require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "BrikReactNative"
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.homepage     = package['homepage']
  s.authors      = { 'Brik' => 'noreply@brik.dev' }
  s.source       = { :git => package['repository']['url'], :tag => "v#{s.version}" }

  s.ios.deployment_target = '14.0'

  s.source_files = 'ios/**/*.{h,m,mm,swift}'

  s.dependency 'React-Core'

  # Swift version
  s.swift_version = '5.0'

  # Enable modular headers
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
