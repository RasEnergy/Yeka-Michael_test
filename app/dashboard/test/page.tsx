"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/src/hooks/useAuth"
import { apiClient } from "@/src/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message?: string
  duration?: number
}

export default function TestIntegrationPage() {
  const { user } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Authentication Check", status: "pending" },
    { name: "API Connection", status: "pending" },
    { name: "Classes API", status: "pending" },
    { name: "Subjects API", status: "pending" },
    { name: "Teachers API", status: "pending" },
    { name: "User Permissions", status: "pending" },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, ...updates } : test)))
  }

  const runTests = async () => {
    setIsRunning(true)

    // Reset all tests
    setTests((prev) => prev.map((test) => ({ ...test, status: "pending" as const })))

    // Test 1: Authentication Check
    const authStart = Date.now()
    if (user) {
      updateTest(0, {
        status: "success",
        message: `Authenticated as ${user.firstName} ${user.lastName}`,
        duration: Date.now() - authStart,
      })
    } else {
      updateTest(0, {
        status: "error",
        message: "No authenticated user found",
        duration: Date.now() - authStart,
      })
    }

    // Test 2: API Connection
    const apiStart = Date.now()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/health`)
      if (response.ok) {
        const data = await response.json()
        updateTest(1, {
          status: "success",
          message: `API healthy - Status: ${data.status}`,
          duration: Date.now() - apiStart,
        })
      } else {
        updateTest(1, {
          status: "error",
          message: `API returned ${response.status}`,
          duration: Date.now() - apiStart,
        })
      }
    } catch (error) {
      updateTest(1, {
        status: "error",
        message: "Failed to connect to API",
        duration: Date.now() - apiStart,
      })
    }

    // Test 3: Classes API
    if (user?.branchId) {
      const classesStart = Date.now()
      try {
        const response = await apiClient.get(`/classes/branch/${user.branchId}`)
        updateTest(2, {
          status: response.success ? "success" : "error",
          message: response.success
            ? `Found ${response.data?.classes?.length || 0} classes`
            : response.error || "Failed to fetch classes",
          duration: Date.now() - classesStart,
        })
      } catch (error) {
        updateTest(2, {
          status: "error",
          message: "Classes API error",
          duration: Date.now() - classesStart,
        })
      }
    } else {
      updateTest(2, {
        status: "error",
        message: "No branch ID available",
        duration: 0,
      })
    }

    // Test 4: Subjects API
    if (user?.schoolId) {
      const subjectsStart = Date.now()
      try {
        const response = await apiClient.get(`/subjects/school/${user.schoolId}`)
        updateTest(3, {
          status: response.success ? "success" : "error",
          message: response.success
            ? `Found ${response.data?.subjects?.length || 0} subjects`
            : response.error || "Failed to fetch subjects",
          duration: Date.now() - subjectsStart,
        })
      } catch (error) {
        updateTest(3, {
          status: "error",
          message: "Subjects API error",
          duration: Date.now() - subjectsStart,
        })
      }
    } else {
      updateTest(3, {
        status: "error",
        message: "No school ID available",
        duration: 0,
      })
    }

    // Test 5: Teachers API
    if (user?.branchId) {
      const teachersStart = Date.now()
      try {
        const response = await apiClient.get(`/teachers/branch/${user.branchId}`)
        updateTest(4, {
          status: response.success ? "success" : "error",
          message: response.success
            ? `Found ${response.data?.teachers?.length || 0} teachers`
            : response.error || "Failed to fetch teachers",
          duration: Date.now() - teachersStart,
        })
      } catch (error) {
        updateTest(4, {
          status: "error",
          message: "Teachers API error",
          duration: Date.now() - teachersStart,
        })
      }
    } else {
      updateTest(4, {
        status: "error",
        message: "No branch ID available",
        duration: 0,
      })
    }

    // Test 6: User Permissions
    const permStart = Date.now()
    if (user?.role) {
      const hasRequiredRole = ["SUPER_ADMIN", "BRANCH_ADMIN", "REGISTRAR"].includes(user.role)
      updateTest(5, {
        status: hasRequiredRole ? "success" : "error",
        message: `User role: ${user.role} ${hasRequiredRole ? "(Authorized)" : "(Limited access)"}`,
        duration: Date.now() - permStart,
      })
    } else {
      updateTest(5, {
        status: "error",
        message: "No user role found",
        duration: Date.now() - permStart,
      })
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      case "pending":
        return <Badge variant="secondary">Running...</Badge>
    }
  }

  const successCount = tests.filter((t) => t.status === "success").length
  const errorCount = tests.filter((t) => t.status === "error").length
  const pendingCount = tests.filter((t) => t.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Integration Tests</h1>
            <p className="text-muted-foreground">Verify that all systems are working correctly</p>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running Tests..." : "Run Tests"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Running</p>
                  <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
                </div>
                <Loader2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Test Results</CardTitle>
            <CardDescription>Detailed results for each integration test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium text-card-foreground">{test.name}</h3>
                      {test.message && <p className="text-sm text-muted-foreground">{test.message}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {test.duration !== undefined && (
                      <span className="text-xs text-muted-foreground">{test.duration}ms</span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
