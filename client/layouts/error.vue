<template>
  <div class="error">
    <span class="emoji">🤪</span>
    <Title>{{ errorMessage }}</Title>
    <nuxt-link to="/" class="link">
      return home
    </nuxt-link>
  </div>
</template>

<script>
import Title from '~/components/text/Title';

export default {
  components: {
    Title
  },
  props: {
    error: {
      type: Object,
      default: () => ({
        message: 'error'
      })
    }
  },
  data() {
    return {
      errorMessage:
        this.error.message === 'This page could not be found'
          ? 'oops! this page cannot be found'
          : this.error.message
    };
  }
};
</script>

<style scoped lang="postcss">
.error {
  padding: 100px;
  text-align: center;
}

.emoji {
  font-size: 10rem;
}

.link {
  display: inline-block;
  padding: 10px;
  margin: 20px;
  font-size: 2rem;
  color: white;
  text-decoration: none;
  background-color: $bg;
  border-radius: 5px;
  transition: background-color 100ms ease-in-out-quad;
}

.link:hover,
.link:focus {
  background-color: color-mod($bg shade(50%));
  transition: background-color 100ms ease-in-out-quad;
}
</style>
