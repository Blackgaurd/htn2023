from transformers import pipeline

captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
captions = captioner("https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2022/10/types-rashes-slide42.jpg?w=1155")

for caption in captions:
    print(caption["generated_text"])
