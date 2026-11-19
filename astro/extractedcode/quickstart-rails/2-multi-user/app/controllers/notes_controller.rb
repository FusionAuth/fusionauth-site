class NotesController < ApplicationController
  # set up a directory for multi-user files
  DATA_DIR = Rails.root.join('user_data')
  FileUtils.mkdir_p(DATA_DIR)

  def show
    target_file = user_file

    # Ensure the file exists so we don't crash
    File.write(target_file, "Hello #{session[:user]['name']}!") unless File.exist?(target_file)
    @name = session[:user]['name']
    @content = File.read(target_file)
  end

  def save
    File.write(user_file, params[:content])
    redirect_to root_path # Refresh the page to show updated content
  end

  private

  # helper to get specific user file
  def user_file
    DATA_DIR.join("note-#{session[:user]['id']}.txt")
  end
end
