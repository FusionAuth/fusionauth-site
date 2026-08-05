package io.fusionauth.quickstart.springapi;

import java.math.BigDecimal;

public class Change {
    private BigDecimal total;

    private Integer nickels;

    private Integer pennies;

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
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
}
