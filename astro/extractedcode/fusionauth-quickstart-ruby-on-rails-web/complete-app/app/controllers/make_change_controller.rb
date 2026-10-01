class MakeChangeController < ApplicationController
  def index
    if defined? params[:amount]
      amount = params[:amount].to_d
      @formatted_amount = sprintf("%0.2f", amount)
      @nickels = (amount / 0.05).to_i
      @pennies = ((amount - 0.05*@nickels) / 0.01).round
    end
  end
end
