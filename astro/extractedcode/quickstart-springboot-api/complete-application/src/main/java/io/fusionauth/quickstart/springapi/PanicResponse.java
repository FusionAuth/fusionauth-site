package io.fusionauth.quickstart.springapi;

public class PanicResponse {

    public PanicResponse(String message) {
        this.message = message;
    }

    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
