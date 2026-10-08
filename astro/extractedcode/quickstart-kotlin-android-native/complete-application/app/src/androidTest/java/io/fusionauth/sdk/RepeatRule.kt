package io.fusionauth.sdk

import org.junit.rules.TestRule
import org.junit.runner.Description
import org.junit.runners.model.Statement

/**
 * RepeatRule is a JUnit TestRule that allows a test method to be repeated a specified number of times.
 *
 * When an instance of RepeatRule is applied to a test, it checks if the test method has the @Repeat annotation.
 * If the annotation is present, the test method will be repeated the number of times specified in the annotation value.
 *
 * Example usage:
 * ```
 * @Test
 * @Repeat(3)
 * fun testMethod() {
 *    */
class RepeatRule : TestRule {

    /**
     * A class that represents a repeated statement.
     *
     * This class is used in conjunction with the RepeatRule class to repeat a given statement a specified number of
     * times.
     *
     * @property statement The statement to be repeated.
     * @property repeat The number of times the statement should be repeated.
     */
    private class RepeatStatement(private val statement: Statement, private val repeat: Int) : Statement() {
        @Throws(Throwable::class)
        override fun evaluate() {
            repeat(repeat) {
                statement.evaluate()
            }
        }
    }

    /**
     * Applies the RepeatRule to the given test statement and description.
     *
     * If the description contains the @Repeat annotation, the test statement will be repeated
     * the specified number of times. Otherwise, the original test statement is returned.
     *
     * @param statement the test statement to be applied
     * @param description the description of the test
     * @return the modified test statement with the RepeatRule applied
     */
    override fun apply(statement: Statement, description: Description): Statement {
        var result = statement
        val repeat = description.getAnnotation(Repeat::class.java)
        if (repeat != null) {
            val times = repeat.value
            result = RepeatStatement(statement, times)
        }
        return result
    }
}
