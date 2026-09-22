require "test_helper"

class MakeChangeControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get make_change_index_url
    assert_response :success
  end
end
