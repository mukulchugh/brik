#!/usr/bin/env ruby
require 'xcodeproj'

# Path to the Xcode project
project_path = File.join(__dir__, 'ios/brikexpo.xcodeproj')
project = Xcodeproj::Project.open(project_path)

# Get the main target (the app target)
target = project.targets.first

# Find the main group (brikexpo folder in Xcode)
main_group = project.main_group['brikexpo']

# Create or get the Generated group with full path
generated_group = main_group['Generated'] || main_group.new_group('Generated', 'brikexpo/Generated', :group)

# Add the Swift file (path relative to ios directory, not the group)
swift_file_path = 'brikexpo/Generated/OrderTrackingActivity.swift'
file_ref = project.new_file(swift_file_path)

# Add file to the Generated group visually
generated_group << file_ref

# Add to compile sources build phase
target.source_build_phase.add_file_reference(file_ref)

# Save the project
project.save

puts "[Brik] ✅ Successfully added OrderTrackingActivity.swift to Xcode project"
puts "[Brik] File is now in Build Phases → Compile Sources"
