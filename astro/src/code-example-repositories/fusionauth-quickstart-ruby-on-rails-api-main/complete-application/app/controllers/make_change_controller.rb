class MakeChangeController < ApplicationController
    def index
      # further claims/authorization checks
      roles = []
      if request.env['jwt.payload'] && request.env['jwt.payload']['roles']
        roles = request.env['jwt.payload']['roles']
      end
      if (roles & ['teller', 'customer']).empty?
        render json: { message: "You must be a teller or customer for this action." }.to_json, status: :unauthorized
        return
      end
    
      total = params[:total]
      message = "We can make change using"
      begin
      remainingAmount = total.to_f
      rescue message = "Problem converting the submitted value to a decimal.  Value submitted: "+total
      end

      coins = {
        0.25 => "quarters",
        0.10 => "dimes",
        0.05 => "nickels",
        0.01 => "pennies"
      }

      output = {
        Message: message,
        Change: []
      }

      coins.each do |value, coinName|
        coinCount = (remainingAmount / value.to_f).to_i
        remainingAmount = ((remainingAmount - coinCount * value) * 100).round.to_f / 100
        output[:Message] += " " + coinCount.to_s + " " + coinName
        output[:Change].push({Denomination: coinName, Count: coinCount})
      end

      render json: output.to_json, status: :ok
    end
  end