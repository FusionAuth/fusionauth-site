<script setup>
const { data } = await useFetch('/api/note');
</script>

<template>
  <a href="/logout" class="logout-btn" style="float: right; background: #dc3545; color: white; padding: 8px 15px; text-decoration: none; border-radius: 4px">Logout</a>
  <p style="float: right; margin-right: 20px">Welcome, {{ data.name }}</p>
  <h1>Personal Note Editor</h1>
  <form method="POST" action="/api/note">
    <textarea name="content" :value="data.content" style="width: 100%; height: 300px; padding: 10px" />
    <br />
    <button type="submit" style="padding: 10px 20px; background: #007bff; color: white; border: none">Save Changes</button>
  </form>
</template>
