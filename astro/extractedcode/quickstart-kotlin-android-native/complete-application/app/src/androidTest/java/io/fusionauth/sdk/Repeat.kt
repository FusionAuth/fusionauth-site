package io.fusionauth.sdk

/**
 * The Repeat annotation is used to specify the number of times a test method or annotation class should be repeated.
 * It can be applied to test methods or annotation classes.
 *
 * @param value The number of times the test method or annotation class should be repeated. Default value is 1.
 */
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.ANNOTATION_CLASS)
annotation class Repeat(val value: Int = 1)
