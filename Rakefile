require 'fileutils'

desc "Package the app for deployment"
task :package do
  exclude = %w".gitignore Rakefile"
  files = `git ls-files`.split(/\n/) - exclude
  version = File.open("manifest.json").read.match( /version.*?([\d\.]+)/ )[1]
  FileUtils.mkdir_p "release"
  files.each do |f|
    FileUtils.mkdir_p "__deploy/#{File.dirname f}"
    FileUtils.copy f, "__deploy/#{File.dirname f}/"
  end
  `zip -r release/comps-#{version}.zip __deploy`
  FileUtils.rm_rf "__deploy", :secure => true
end
