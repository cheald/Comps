require 'fileutils'

desc "Package the app for deployment"
task :package do
  exclude = %w".gitignore Rakefile"
  files = `git ls-files`.split(/\n/) - exclude
  version = File.open("manifest.json").read.match( /version.*?([\d.]+)/ )[1]
  FileUtils.mkdir_p "__deploy"
  FileUtils.mkdir_p "release"
  files.each do |f|
    FileUtils.copy f, "__deploy"
  end
  FileUtils.rm_rf "__deploy", :secure => true
  `zip -r release/comps-#{version}.zip __deploy`
end