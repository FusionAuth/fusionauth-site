<script setup>
const { data } = await useFetch('/api/note');
</script>

<template>
  <h1>Edit: note.txt</h1>
  <form method="POST" action="/api/note">
    <textarea name="content" :value="data.content" style="width: 100%; height: 300px; padding: 10px" />
    <br />
    <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none">Save Changes</button>
  </form>
</template>
