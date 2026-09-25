require "test_helper"

class MakeChangeControllerTest < ActionDispatch::IntegrationTest
  test "redirects signed-out users home" do
    get make_change_url
    assert_redirected_to root_url
  end
end
