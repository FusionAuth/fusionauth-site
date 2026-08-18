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

      # String#to_f returns 0.0 for input it cannot parse rather than raising,
      # so anything non-numeric has to be rejected explicitly. Otherwise
      # "nonsense" is reported as a successful request for zero change.
      begin
        amount = Float(total)
      rescue ArgumentError, TypeError
        render json: {
          message: "Problem converting the submitted value to a decimal.  Value submitted: #{total}"
        }.to_json, status: :bad_request
        return
      end

      if amount.negative?
        render json: {
          message: "The submitted value must not be negative.  Value submitted: #{total}"
        }.to_json, status: :bad_request
        return
      end

      # Work in whole cents. Repeatedly subtracting values such as 0.01 in
      # floating point accumulates error and can yield an invalid breakdown.
      remainingCents = (amount * 100).round

      coins = {
        25 => "quarters",
        10 => "dimes",
        5 => "nickels",
        1 => "pennies"
      }

      output = {
        Message: "We can make change using",
        Change: []
      }

      coins.each do |value, coinName|
        coinCount = remainingCents / value
        remainingCents -= coinCount * value
        output[:Message] += " " + coinCount.to_s + " " + coinName
        output[:Change].push({Denomination: coinName, Count: coinCount})
      end

      render json: output.to_json, status: :ok
    end
  end