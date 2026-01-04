# Tuning OpenAI's GPT-2 model to generate a list of activities given travel location
from transformers import GPT2LMHeadModel, GPT2Tokenizer

model_name = "gpt2-medium"
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

prompt = "Plan a 3-day trip to Paris:"
input_ids = tokenizer.encode(prompt, return_tensors="pt")
# print(input_ids)
output = model.generate(input_ids, max_length=200, num_return_sequences=1, no_repeat_ngram_size=2)

generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
print(generated_text)

