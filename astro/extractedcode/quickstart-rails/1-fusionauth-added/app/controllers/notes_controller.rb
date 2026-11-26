class NotesController < ApplicationController
  TARGET_FILE = Rails.root.join('note.txt')

  def show
    # Ensure the file exists so we don't crash
    File.write(TARGET_FILE, 'Hello! Edit this text.') unless File.exist?(TARGET_FILE)
    @content = File.read(TARGET_FILE)
  end

  def save
    File.write(TARGET_FILE, params[:content])
    redirect_to root_path # Refresh the page to show updated content
  end
end
