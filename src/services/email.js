export class ConfirmationEmailError extends Error {
  constructor(message = "The confirmation email could not be sent.") {
    super(message);
    this.name = "ConfirmationEmailError";
  }
}

export const sendBookingConfirmation = async (booking) => {
  const response = await fetch("/api/send-confirmation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(booking),
  });

  if (!response.ok) {
    let message;

    try {
      const data = await response.json();
      message = data.error;
    } catch {
      message = undefined;
    }

    throw new ConfirmationEmailError(message);
  }

  return response.json();
};
