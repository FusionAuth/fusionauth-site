package io.fusionauth.quickstart.springweb.model;

public class Change {
    private String error;
    private String total = "0";
    private Integer nickels = 0;
    private Integer pennies = 0;

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getTotal() {
        return total;
    }

    public void setTotal(String total) {
        this.total = total;
    }

    public Integer getNickels() {
        return nickels;
    }

    public void setNickels(Integer nickels) {
        this.nickels = nickels;
    }

    public Integer getPennies() {
        return pennies;
    }

    public void setPennies(Integer pennies) {
        this.pennies = pennies;
    }

    public String getMessage() {
        return String.format("We can make change for $%s with %s nickels and %s pennies!", getTotal(), getNickels(), getPennies());
    }
}
