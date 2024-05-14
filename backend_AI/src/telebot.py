from telegram.ext import Updater, CommandHandler
from env import tele_api_key

# Define the start command handler
def start(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Hello! Use /getid to get your user ID.")

# Define the getid command handler
def get_id(update, context):
    user_id = update.effective_user.id
    context.bot.send_message(chat_id=update.effective_chat.id, text=f"Your Telegram user ID is: {user_id}")

# Set up the Telegram Bot
def main():
    # Initialize the updater and dispatcher
    # updater = Updater(tele_api_key, use_context=True)
    updater = Updater(tele_api_key)
    dispatcher = updater.dispatcher

    # Add handlers for commands
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("getid", get_id))

    # Start the Bot
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
